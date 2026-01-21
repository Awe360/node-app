pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'npm install'
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
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
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