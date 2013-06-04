# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: Testing public and private posts on CBU @CBU-ALL @CBU-C
    Given I join a new project
    And I post public and private updates
    Then I should see the updates based on my membership with the project


    # dependent on some steps in CBU-A to create the test email and password

    Scenario: Log In @CBU-ALL @CBU-C
        Given I go to "http://testing.v3.changeby.us/signup#"
        And I fill in field with id "login-email" with a random email identified by "A-test-email"
        And I fill in field with id "login-password" with a random password identified by "A-test-password"
        And I press "Log In"
        Then I should see "Welcome A-Tester"

    Scenario: I create a project
        Given I click "Welcome A-Tester"
        And I click "Create a project"
        And I fill in field with id "project_name" with a random name identified by "C-test-project-name"
        And I fill in field with id "project_description" with random text identified by "C-test-project-description" and length "20"
        And I fill in field with id "project_location" with "10003"
        And I press "Create"
        Then I should see the text identified by "C-test-project-name"

    Scenario: Creating private & public posts on my project @CBU-ALL @CBU-C
        Given I press "Post"
        And I fill in field with id "title-field" with a random name identified by "C-test-post-name-private"
        And I fill in field with id "update-field" with random text identified by "C-test-post-description-private" and length "20"
        And I press "Post"
        And I press "Close"
        And I see the text identified by "C-test-post-name-private"
        And I go to "http://testing.v3.changeby.us/"
        And I click the text identified by "C-test-project-name"
        And I press "Post"
        And I press "Members Only"
        And I click "Members Only"
        And I click "Public Blog"
        And I fill in field with id "title-field" with a random name identified by "C-test-post-name-public"
        And I fill in field with id "update-field" with random text identified by "C-test-post-description-public" and length "20"
        And I press "Post"
        And I press "Close"
        Then I should see the text identified by "C-test-post-name-public"

    Scenario: Creating an additional account to join and leave the project with @CBU-ALL @CBU-C
        Given I go to "http://testing.v3.changeby.us/logout"
        And I go to "http://testing.v3.changeby.us/signup#"
        And I see "Please log in before continuing!"
        And I fill in field with id "signup-display-name" with a random name identified by "C-test-username"
        And I fill in field with id "signup-first-name" with "C-Tester"
        And I fill in field with id "signup-last-name" with "TesterLastname"
        And I fill in field with id "signup-email" with a random email identified by "C-test-email"
        And I fill in field with id "signup-password" with a random password identified by "C-test-password"
        And I press "Sign Up"
        Then I should see "Welcome C-Tester"

    Scenario: Joining the previously created project and viewing private & public posts @CBU-ALL @CBU-C
        Given I click "View ChangeBy.us"
        And I click the text identified by "C-test-project-name"
        And I press "Join Us"
        And I see the text identified by "C-test-post-name-public"
        Then I should see the text identified by "C-test-post-name-private"

    Scenario: Leaving a project and viewing posts @CBU-ALL @CBU-C
        Given I press "Leave Project"
        And I see "Join Us"
        And I see the text identified by "C-test-post-name-public"
        Then I should not see the text identified by "C-test-post-name-private"

    Scenario: Re-joining a project and viewing posts @CBU-ALL @CBU-C
        Given I press "Join Us"
        And I see "Leave Project"
        And I see the text identified by "C-test-post-name-public"
        Then I should see the text identified by "C-test-post-name-private"

    Scenario: Logging out @CBU-ALL @CBU-C
        Given I click "Welcome C-Tester"
        And I click "Log Out"
        Then I should see "Sign Up"
