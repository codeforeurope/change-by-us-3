# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: CBU Home Page @CBU-ALL @CBU-G
    Given I link my twitter account to CBU
    I should be able to log in to CBU
    And I should be able to post to twitter
    Then I should see my post on twitter

    Scenario: The home page exists @CBU-ALL @CBU-G
        Given I go to "http://testing.v3.changeby.us/"
        And I see the browser title is "Change By Us"
        And I see an image with source "/static/img/icon_promote.png"
        And I see "Active Projects"
        Then I should see a link that contains the text "Sign" and the url "#signupModal"

    Scenario: Attempt to login with wrong account using unicode @CBU-ALL @CBU-G
        Given I go to "http://testing.v3.changeby.us/signup#"
        And I see "Please log in before continuing!"
        And I fill in field with id "login-email" with a random unicode email identified by "wrong-email-unicode"
        And I fill in field with id "login-password" with random unicode identified by "wrong-password-unicode"
        And I press "Log In"
        Then I should see "Please log in before continuing!"

    Scenario: Attempting to create an account using unicode @CBU-ALL @CBU-G
        Given I see "Please log in before continuing!"
        And I fill in field with id "signup-display-name" with random unicode identified by "random-username-unicode"
        And I fill in field with id "signup-first-name" with random unicode identified by "random-first-name-unicode"
        And I fill in field with id "signup-last-name" with random unicode identified by "random-last-name-unicode"
        And I fill in field with id "signup-email" with a random unicode email identified by "random-email-unicode"
        And I fill in field with id "signup-password" with random unicode identified by "random-password-unicode"
        And I press "Sign Up"
        Then I should see the text identified by "random-first-name-unicode"

    Scenario: Creating a project using unicode @CBU-ALL @CBU-G
        Given I go to "http://testing.v3.changeby.us/project/create#"
        And I see "Create a Project"
        And I fill in field with id "project_name" with random unicode identified by "unicode-project-name"
        And I fill in textarea with id "project_description" with random unicode identified by "unicode-project-description"
        And I fill in field with id "project_location" with "10003"
        And I press "Create"
        Then I should see the text identified by "unicode-project-name"

    Scenario: Post public update @CBU-ALL @CBU-G
        Given I press "View Dashboard"
        And I press "Select Project"
        And I click the text identified by "unicode-project-name"
        And I fill in field with id "title-field" with random unicode identified by "unicode-update-title"
        And I fill in field with id "update-field" with random unicode identified by "unicode-update-description"
        And I press "Post"
        And I press "Close"
        Then I should see the text identified by "unicode-update-title"