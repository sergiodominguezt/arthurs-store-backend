#!/bin/bash

echo 'run application_start.sh: ' >> /home/ec2-user/arthurs-store-backend/deploy.log

# Verificar si el proceso está en ejecución
if ! pm2 describe arthurs-store-backend > /dev/null; then
  echo 'Starting arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
  pm2 start /path/to/your/app --name arthurs-store-backend >> /home/ec2-user/arthurs-store-backend/deploy.log
else
  echo 'Restarting arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
  pm2 restart arthurs-store-backend >> /home/ec2-user/arthurs-store-backend/deploy.log
fi