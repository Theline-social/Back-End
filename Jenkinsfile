pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
    }
  
    stages {
         stage('Cleanup Workspace') {
            steps {
                // Clean up the workspace to ensure no conflicts with previous builds
                script {
                    sh '''
                        if [ -d "Back-End" ]; then rm -rf Back-End; fi
                    '''
                }
            }
        }
        
        stage('Checkout Backend') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-auth', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USERNAME')]) {
                    sh 'git clone https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Motaql-Social-media/Back-End.git'
                }
            }
        }
        stage('Build Backend Image') {
            steps {
                script {
                    dir('Back-End') {
                        sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                        sh 'docker build -t backend-image .'
                        sh "docker tag backend-image:latest ${DOCKERHUB_CREDENTIALS_USR}/backend-image:latest"
                        echo 'pushing to hub....'
                        sh 'docker push ${DOCKERHUB_CREDENTIALS_USR}/backend-image:latest'
                        sh 'docker logout'
                    }
                }
            }
        }
        
   stage('Deploy to Kubernetes') {
            steps {
                script {
                    withEnv(["KUBECONFIG=/var/lib/jenkins/.kube/config"]) {
                        dir('Back-End') {
                            sh 'kubectl delete deployment backend-deployment'
                            sh 'kubectl apply -f k8s/backend-depl.yaml --validate=false'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            script {
                echo 'Cleaning up Docker system...'
                // Remove all stopped containers
                sh 'docker container prune -f'
                // Remove all dangling images
                sh 'docker image prune -f'
                // Remove all unused volumes
                sh 'docker volume prune -f'
                // Remove all unused networks
                sh 'docker network prune -f'
                // Remove all unused Docker objects (containers, images, volumes, networks)
                sh 'docker system prune -a -f'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
