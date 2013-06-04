# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: Testing Facebook signeup and posting on CBU @CBU-ALL @CBU-D
    Given I create a new account through Facebook
    And I post a project update to Facebook
    Then I should see the update on Facebook

    # note this will always use the same account since we only have 1 facebook account
    # also note that this script expects the account to have previously revoked
    # access to our application, or never have given the account permission in the first place

    Scenario: Creating an account with Facebook @CBU-ALL @CBU-D
        Given I go to "http://testing.v3.changeby.us/"
        And I click "Sign Up"
        And I click "Sign Up With Facebook"
        And I fill in field with id "email" with "cbu-v3-test@localprojects.net"
        And I fill in field with id "pass" with "oboeoboe123"
        And I press "Log In"
        And I press "Okay"
        And I press "Okay"
        Then I should see "View Dashboard"

    Scenario: I log out of facebook and log back in @CBU-ALL @CBU-D
        Given I go to "http://testing.v3.changeby.us"
        And I see the browser title is "Change By Us"
        And I click "Welcome Cbu-tester"
        And I click "Log Out"
        And I click "Sign Up"
        And I click "Sign Up With Facebook"
        Then I should see "View Dashboard"

    Scenario: I create a test project @CBU-ALL @CBU-D
        Given I click "Welcome Cbu-tester"
        And I click "Create a project"
        And I fill in field with id "project_name" with a random name identified by "D-test-project-name"
        And I fill in field with id "project_description" with random text identified by "D-test-project-description" and length "20"
        And I fill in field with id "project_location" with "10003"
        And I press "Create"
        Then I should see the text identified by "D-test-project-name"

    Scenario: Posting project update to Facebook @CBU-ALL @CBU-D
        Given I click "View ChangeBy.us"
        Given I see the text identified by "D-test-project-name"
        And I click the text identified by "D-test-project-name"
        And I press "Post"
        And I press "Members Only"
        And I click "Facebook"
        And I fill in field with id "title-field" with a random name identified by "D-test-facebook-post-name"
        And I fill in field with id "update-field" with random text identified by "D-test-facebook-post-text" and length "20"
        And I press "Post"
        And I see "Posted Successfully to Facebook"
        And I press "Close"
        Then I should see the text identified by "D-test-facebook-post-name"

    Scenario: Disable Facebook permissions and logging out @CBU-ALL @CBU-D
        Given I go to "http://testing.v3.changeby.us/social/facebook/revoke"
        And I see "OK"
        And I go to "http://testing.v3.changeby.us/"
        And I click "Welcome Cbu-tester"
        And I click "Log Out"
        Then I should see "Sign Up"

    Scenario: Verifying post on Facebook @CBU-ALL @CBU-D
        Given I go to "https://www.facebook.com/cbutester.cbutester"
        And I see "Cbu-tester"
        Then I should see the text identified by "D-test-facebook-post-name"

    Scenario: Verifying Facebook permissions revoked @CBU-ALL @CBU-D
        Given I go to "https://www.facebook.com/settings?tab=applications"
        And I see "App Settings"
        Then I should not see "cbu-alhpa"




        