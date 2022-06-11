# Accounting analyzer application

[![Accounting-analyzer](https://github.com/gmag95/personalpage/blob/main/public/img/screenshots/analyzer.webp?raw=true)](https://www.accounting-analyzer.tk/)

This application allows the ordinary bookkeeping operations for a selected company.

Throught the frontend, written in vanilla Javascript, the user is able to access all the data stored in the database, view a snapshot of the Company's financial statement at a selected date and add/delete postings.  Finally the Analytics section gives insights on the past and current performance of the Company.

The HTTP requests are managed through Node.js running on the Digitalocean app platform. As for the databases PostgreSQL is used to store the accounting data while the login and sessions data are stored in a MongoDB instance. The PostgreSQL database was set-up manually on top of an Oracle VM instance while the MongoDB one is managed using the Mongo Atlas service.
