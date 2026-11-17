#!/bin/bash


read -p "Enter a url :: " base_url


     dos(){

        local url=$1
    
     
       status=$(curl -X -H "Content-Type:Application/json"\
                 {"id": "1794730647010",
      "username": "user8",
      "email": "user8@test.com",
      "password": "$user8@123"}

      )

echo "$status"

}
