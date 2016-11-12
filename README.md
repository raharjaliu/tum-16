# tum-16

## How to run the FE 

	npm install
	grunt serve

or
	
	grunt auto-build

## How to run without grunt or whatever

	sudo apt-get install nginx 
	sudo ln -s ${path_to_nginx_conf} /etc/nginx/sites-available/my.conf
	sudo ln -s /etc/nginx/sites-available/my.conf /etc/nginx/sites-enabled/my.conf
	sudo service nginx reload

## Run geth with HttpRegistry 

	geth --rpccorsdomain "*" --rpc --networkid 8545 --rpcapi="db,eth,net,web3,personal,web3" --mine --minerthreads=4 --testnet console 2>>geth.log
	cd slack
	npm install
	npm start
