#-*- coding: utf-8 -*-
from flask.ext.script import Manager, Command, Option
from changebyus import create_app
from changebyus.project.helpers import _create_category
from changebyus.project.models import ProjectCategory


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
    


# Initialize the flask application
manager = Manager(create_app)

manager.add_command("add_category", AddCategory())


if __name__ == "__main__":
    manager.run()


        