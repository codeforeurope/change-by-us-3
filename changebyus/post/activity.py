# from .models import ProjectPost, Project, User
from ..project.models import UserProjectLink, Project

def update_project_activity(project_id): 
    """
    Update project activity score, i.e. project.activity.
    """
    project = Project.objects.with_id(project_id)
    
    project.activity = calculate_project_activity(project)
    
    project.save()
    
def calculate_project_activity(project):
    """
    Calculate project activity score based on posts and users
    """
    num_priv_posts = _get_num_private_posts(project)
    num_pub_posts = _get_num_public_posts(project)
    num_comments = _get_num_comments(project)
    num_users = _get_num_users(project)
    
    activity = (10.0*num_pub_posts + num_priv_posts + num_comments) / num_users
    
    return activity
    
    
def _get_num_private_posts(project):
    from .models import ProjectPost
    return ProjectPost.objects(project = project, parent_id = None, public = False).count()
    
    
def _get_num_public_posts(project):
    from .models import ProjectPost
    return ProjectPost.objects(project = project, parent_id = None, public = True).count()
    
    
def _get_num_comments(project):
    from .models import ProjectPost
    return ProjectPost.objects(project = project, parent_id__ne = None, public = True).count()
    
    
def _get_num_users(project):
#     return UserProjectLink.objects(project = project, user.active = True)
    numOwners = 1
    return UserProjectLink.objects(project = project).count() + numOwners