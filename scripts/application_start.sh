#!/bin/bash

echo 'run application_start.sh: ' >> /home/ec2-user/arthurs-store-backend/deploy.log
# nodejs-app is the same name as stored in pm2 process
echo 'pm2 restart arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
pm2 restart arthurs-store-backend >> /home/ec2-user/arthurs-store-backend/deploy.log