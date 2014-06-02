Notes about Vagrant setup Change By Us 3
---------------------------------------

In the `Vagrantfile` specify some IPs to forward:

    config.vm.network "forwarded_port", guest:5000, host:5000
    config.vm.network "forwarded_port", guest:27017, host:27017

and also specify where configuration for Puppet should be derived from:

      config.vm.provision "puppet" do |puppet|
        puppet.manifests_path = "puppet/manifests"
        puppet.module_path    = 'puppet/modules'
        puppet.manifest_file  = "site.pp"
        puppet.options        = [
                              '--verbose',
                              #'--debug',
                            ]
      end

In the Vagrant VM:

    cd /vagrant 

Once in the `/vagrant` folder, run:

    sudo apt-get update

    sudo apt-get install pip
    sudo apt-get install git
    sudo pip-install virtualenvwrapper
    sudo apt-get install build-essential
    sudo apt-get install python-dev
    sudo pip install -r requirements.txt
    
    
This is my complete manifest file (called `site.pp` that made my deployment work (on a Vagrant setup). I only wanted to install Mongo and it's what I achieved.  

    class {'::mongodb::server':
      #port    => 27017,  #the default port
      verbose => true,
      auth => true,
      bind_ip => ['0.0.0.0'] #Necessary for Vagrant to bind on the correct IP address instead of the loopback 127.0.0.1
    }
    
    #if we install a different port this did not work for me
    mongodb::db { 'testdb':
      user          => 'user1',
      password_hash => 'a15fbfca5e3a758be80ceaf42458bcd8', #this means pass1
    }
    
    include '::mongodb::server'


Remember to include the following modules in your `modules` folder:

 - https://github.com/puppetlabs/puppetlabs-mongodb
 - https://github.com/puppetlabs/puppetlabs-stdlib (the first one depends on this one)


Troubleshooting
--------------

 - `ERROR:root:Could not find any typelib for GnomeKeyring` 

See: 

> This is just a warning you can ignore. Python-keyring tries to do "from gi.repository import GnomeKeyring" to check which backends are available.

Source: https://bugs.launchpad.net/ubuntu/+source/python-keyring/+bug/1197988



 