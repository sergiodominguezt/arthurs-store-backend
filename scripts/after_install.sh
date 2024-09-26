#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/arthurs-store-backend/deploy.log

echo 'cd /home/ec2-user/arthurs-store-backend' >> /home/ec2-user/arthurs-store-backend/deploy.log
cd /home/ec2-user/arthurs-store-backend >> /home/ec2-user/arthurs-store-backend/deploy.log

echo 'npm install' >> /home/ec2-user/arthurs-store-backend/deploy.log 
sudo npm install >> /home/ec2-user/arthurs-store-backend/deploy.log