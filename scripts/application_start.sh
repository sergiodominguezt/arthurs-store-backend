#!/bin/bash
echo 'Starting application_start.sh' >> /home/ec2-user/arthurs-store-backend/deploy.log
echo 'Current directory: ' $(pwd) >> /home/ec2-user/arthurs-store-backend/deploy.log
echo 'Environment PATH: ' $PATH >> /home/ec2-user/arthurs-store-backend/deploy.log

echo 'run application_start.sh: ' >> /home/ec2-user/arthurs-store-backend/deploy.log

# Verificar si el proceso está en ejecución
if ! pm2 describe arthurs-store-backend > /dev/null; then
  echo 'Starting arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
  pm2 start npm --name arthurs-store-backend -- run start:dev >> /home/ec2-user/arthurs-store-backend/deploy.log
else
  echo 'Restarting arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
  pm2 restart arthurs-store-backend >> /home/ec2-user/arthurs-store-backend/deploy.log
fi
