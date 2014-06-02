class apt_update {
exec { "aptGetUpdate":
  command => "sudo apt-get update",
  path => ["/bin", "/usr/bin"]
}
}

class {'::mongodb::server':
  #port    => 10062,
  verbose => true,
  auth => true,
  bind_ip => ['0.0.0.0'] #Necessary for Vagrant to bind on the correct IP address instead of the loopback 127.0.0.1
}

#if we use a different port then it's not going to work!!
mongodb::db { 'testdb':
  user          => 'user1',
  password_hash => 'a15fbfca5e3a758be80ceaf42458bcd8',
}


include apt_update
include '::mongodb::server'
