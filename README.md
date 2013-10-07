Comments were placed pretty extensively using what is hopefully reStructuredText
  compatable text.  It should be relatively easy to generate comments from Sphinx,
  or you can just read the files themselves.

Global type comments (what the cbu project is, what it's capable of) is being 
 added as we move, so for now bear with what we have.


## License

The ChangeByUs codebase is open source, licensed under the Affero GNU Public License. Please see the LEGAL/ folder for more details.

https://github.com/blossom/lettuce-webdriver-setup

## Credits
The following organizations (and individuals) contributed to ChangeByUs:
* [Local Projects](http://localprojects.net) envisioned and designed Change By Us for the city of New York. 
* [Knight Foundation](http://www.knightfoundation.org/) funding for this project 
* [blossom / lettuce-webdriver-setup](https://github.com/blossom/lettuce-webdriver-setup) which was used as the basis for our auto-testing
* [imwilsonxu / fbone](https://github.com/imwilsonxu/fbone) helped us provide a flask structure for this project


### requirements
* virtualenv and virtualenvwrapper
* python
* mongodb (local or remote)


### configuration
* create a mongo database 
* copy all the .template files into .yml files and enter config settings.
  - ie changebyus/bitly/config/bitly.template -> changebyus/bitly/config/bitly.yml
  - config files are currently:
    bitly.yml    config.yml   facebook.yml stripe.yml   twitter.yml

### create virtualenv and run app
`mkvirtualenv -p /usr/local/bin/python2.7 --no-site-packages changebyus3`  
`pip install -r requirements.txt`  
`python wsgi.py`

### Grunt setup and usage
* if you have JS files that are missing a coffee source and watch to batch convert JS files to Coffee
* $ sudo npm install js2coffee -g
* $ sh js2coffee.bash

***
* to start using grunt
* $ cd directory/containing/grunt/file
* $ npm install
* $ grunt



### Optional Encryption
* If you choose to use the two part encryption, where one key is stored
  locally and one on a remote server, then you'll need to study and configure
  that module.

### Running from server (Unix)
* Pretty much the same thing just configure uwsgi and nginx, or your
  webserver of choice.  Resources:

### Testing
* In the tests directory we have a set of lettuce automated tests and a readme file

### BUGS
* Depending on the machine, python Pillow may error when trying to create different
  sized images when you create an image.  You will know this because the project images
  will be blank, and you will see "IOError  decoder jpeg not available" in the logs.
  This needs to be troubleshooted on a per-machine basis, for now.

  A few random google searches will provide lots of info as this is a common issue
  I have had luck by installing libjpeg62 libjpeg62-dev before setting up the python
  virtual environment (ie pillow install)

