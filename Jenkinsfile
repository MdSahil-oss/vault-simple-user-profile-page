pipeline {
  environment {
    dockerimagename = "mdsahiloss/vault-simple-user-profile-page"
    dockerImage = ""
  }
  agent any
  stages {
    stage('Checkout Source') {
      steps {
        git 'https://github.com/MdSahil-oss/vault-simple-user-profile-page.git'
      }
    }
    stage('Build image') {
      steps{
        script {
          dockerImage = docker.build dockerimagename
        }
      }
    }
    stage('Pushing Image') {
      environment {
          registryCredential = 'DockerhubCredentials'
           }
      steps{
        script {
          docker.withRegistry( 'https://registry.hub.docker.com', registryCredential ) {
            dockerImage.push("latest")
          }
        }
      }
    }
    stage('Deploying Application container to Kubernetes') {
      steps {
            withKubeConfig([
                        clusterName: 'cluster-name',
                        namespace: 'default',
                        contextName: 'jenkins',
                        serverUrl:   'server-url',
                        credentialsId: 'k8s-creadentials'
                        ]) {
            sh 'kubectl delete -f ./k8s/app-deploy.yaml && kubectl apply -f ./k8s/app-deploy.yaml'
        }
      }
    }
  }
}
