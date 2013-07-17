### Documentation
Setting up a mac for testing:
  * install Firefox and Chrome
  * install homebrew by running the following command in terminal:
     `ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"`
  * do `brew doctor`
      fix any errors before proceeding (e.g. XCode is not installed)
  * install python:
      `brew install python`
  * install virtualenv and virtualenvwrapper
      `pip install virtualenv'
      `pip install virtualenvwrapper'
  * create this folder if it doesn't exist
      'mkdir ~/.virtualenvs'
  * create a folder for cloning the projects to
      'mkdir ~/Projects'
  * add these lines to the end of ~/.profile (if it doesn't exist create one)
      export WORKON_HOME=$HOME/.virtualenvs
      export PROJECT_HOME=$HOME/Projects
      source /usr/local/bin/virtualenvwrapper.sh
      export PATH=/usr/local/bin:$PATH
  * do `source ~/.profile`
  * install git
      `brew install git`
  * do `ssh-keygen` (required for getting access to repository)
  * clone all the necessary branches with `git clone ...` inside ~/Projects
  * install chromedriver
  * create a virtual environment for each project
  * do 'workon ...' for changing the environment
  * install requirements
      `pip install -r requirements.txt`  
  * run the python file, current commands you can pass:
      -b    sets the browser to use, options: chrome, firefox
      -t    tells the program to run specific features (e.g. -t CBU-A)