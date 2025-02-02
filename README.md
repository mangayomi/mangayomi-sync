# SugoiReadsSyncServer

The self-hosted sync server for SugoiReads.

## Requirements

- Node.js (18 or higher)
- MySQL Server (tested and working with Version 8.0.29)
- [pnpm](https://pnpm.io/) (you can also use the normal npm if you prefer it)

## Setup

1. Install Node.js (if you have already installed it, you can skip this) \
Go to the [Official guide](https://nodejs.org/en/download/package-manager), change the OS to yours and follow the steps.
2. Install PNPM (if you have already installed it, you can skip this) \
Go to [pnpm.io](https://pnpm.io/installation) and follow the steps.
3. Setup a MySQL Database Server by either using a hosting platform or on your on machine / server. \
If you need a free MySQL server that runs 24/7: [Aiven.io](https://aiven.io/pricing?product=mysql) (credit card not required!) \
If you want to install your own server on Windows: [XAMPP: the easy way](https://www.apachefriends.org/index.html) \
If you want to install your own server on Unix: [Follow the guide](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04)
4. Now you can clone the GitHub repository to your machine / server: ```git clone https://github.com/SugoiReads/SugoiReadsSyncServer.git```
5. Go to the cloned repository and copy the .env.dist file to a new .env file in the same directory
6. Open .env and add a secret key for the field "JWT_SECRET_KEY": [just auto generate it there](https://codebeautify.org/generate-random-string)
7. Open .env and add the MySQL connection string to the field "DATABASE_URI": \
If you are using the free server from Aiven.io, you can see the URI starting with "mysql://" on the overview. \
If you are using your own server on your local machine, type "mysql://localhost:3306/sugoireads". \
If you are using your own server on a VPS or home lab, type "mysql://USERNAME:PASSWORD@YOUR_SERVER_IP:3306/sugoireads" and append "?ssl-mode=REQUIRED" if configured.
8. Now run ```pnpm install``` to install the dependencies. 
9. Now run ```pnpm run buildstart``` to run the server. 


## How to use it on the client
Go to Settings -> Sync:

Enter the IP + Port / Domain of your Sync Server, email address and a password with at least 8 characters.

Make sure to upload if it's the first time or download if you login on a new device!

\[WIP\]
