pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'  // Install deps
            }
        }
        stage('Test') {
            steps {
                echo 'Run tests here (add npm test if you have tests)'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("awoke/node-crud-app:${env.BUILD_ID}")
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/deployment.yaml' 
            }
        }
    }
}