#-*- coding: utf-8 -*-
from flask.ext.script import Manager, Command, Option, prompt, prompt_pass
from changebyus import create_app
from changebyus.project.helpers import _create_category
from changebyus.project.models import ProjectCategory, ProjectCity
from changebyus.user.helpers import _create_user
from changebyus.user.models import User, Role


class AddCategory(Command):
    option_list = (
        Option('--name'),
        Option('--names')
    )
    
    def run(self, **kwargs):
        if kwargs.get('names'):
            for t in kwargs['names'].split():
                _create_category(t)
        else:
            _create_category(kwargs.get('name'))
        
        cat_list = ProjectCategory.objects()
        
        print("CATEGORIES ARE NOW:")
        print([c.name for c in cat_list])
        

class CreateAdminUser(Command):
    option_list = (
        Option('--username', '-u', dest='username'),
        Option('--pwd', '-p', dest='pwd'),
        Option('--email', '-e', dest='email', required=True)
    )
    
    def run(self, email, username=None, pwd=None):
        admin_role, created_role = Role.objects.get_or_create(name='admin', 
                                                         description='allows for administration of entire site')

        if (created_role):
            print("CREATING ROLE 'admin'")
        
        admin_user = User.objects(email=email).first()
        
        if (admin_user):
            admin_user.roles.append(admin_role)
            admin_user.save()
            print("ADMIN ROLE ADDED TO USER: %s" % admin_user.email)
        else:
            if (not username):
                username = prompt("Enter display name")
                
            if (not pwd):
                pwd = prompt_pass("Enter password")

                admin_user = _create_user(email=email, password=pwd, display_name=username, roles=[admin_role])
                print("ADMIN USER CREATED:")
                print(admin_user.as_dict())
                
                
class CreateProjectCity(Command):
    # 'debug' option is bogus. Just trying to get around apparent 1-option bug
    option_list = (
        Option('--filepath', '-f', dest='filepath'),
        Option('--debug', '-s', dest='debug')
    )
    
    def run(self, filepath=None, debug=None):
        if (filepath):
            import simplejson as json

            data = json.load(open(filepath))['cities']
            
            print("LOADING CITIES FROM FILE...")
        else:
            name = prompt("Name (e.g. Akron, OH)")
            slug = prompt("Slug (e.g. akron-oh)")
            quote = prompt("Quote")
            image_name = prompt("Image name root (e.g. 'akron-oh-1.png')")
            website = prompt("Web url")
            lat = prompt("Location, latitude")
            lon = prompt("Location, longitude")
            
            data = {
                        slug: {
                            'name': name,
                            'quote': quote,
                            'image_name': image_name,
                            'website': website,
                            'lat': lat,
                            'lon': lon
                        }
                    }
    
        for k,v in data.iteritems():
            c = ProjectCity(name=v['name'],
                            quote=v['quote'],
                            image_name=v['image_name'],
                            website=v['website'],
                            geo_location=[float(v['lat']), float(v['lon'])],
                            slug=k)
                            
            c.save()
            print("CREATED CITY: %s" % v['name'])


# Initialize the flask application
manager = Manager(create_app)

manager.add_command("add_category", AddCategory())
manager.add_command("create_admin", CreateAdminUser())
manager.add_command("create_city", CreateProjectCity())


if __name__ == "__main__":
    manager.run()


        