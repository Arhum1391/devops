//Jenkinsfile for Techsol
pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    COMPOSE_FILE = 'docker-compose.pipeline.yml'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build in Docker') {
      steps {
        script {
          docker.image('node:20-alpine').inside(
            "-v ${env.WORKSPACE}:/app -w /app --user root"
          ) {
            sh '''
              apk add --no-cache libc6-compat
              npm ci
              npm run build
            '''
          }
        }
      }
    }

    stage('Compose up') {
      steps {
        sh '''
          docker compose -f docker-compose.pipeline.yml down || true
          docker compose -f docker-compose.pipeline.yml up -d
        '''
      }
    }
  }

  post {
    always {
      sh 'docker compose -f docker-compose.pipeline.yml ps || true'
    }
  }
}
