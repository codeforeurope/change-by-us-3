# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: CBU Home Page @CBU-ALL @CBU-E
    Given I link my twitter account to CBU
    I should be able to log in to CBU
    And I should be able to post to twitter
    Then I should see my post on twitter

    Scenario: Log in with Twitter @CBU-ALL @CBU-E
        Given I go to "http://testing.v3.changeby.us/"
        And I click "Log In"
        And I click "Log In With Twitter"
        And I fill in field with id "username_or_email" with "cbu-v3-test@localprojects.net"
        And I fill in field with id "password" with "oboeoboe123"
        And I press "Authorize app"
        Then I should see "Welcome cbu-tester"

    Scenario: Log out and back in with Twitter @CBU-ALL @CBU-E
        Given I go to "http://testing.v3.changeby.us"
        And I see the browser title is "Change By Us"
        And I click "Welcome cbu-tester"
        And I click "Log Out"
        And I click "Log In"
        And I click "Log In With Twitter"
        And I press "Authorize app"
        # wait for the redirect to occur
        Then I should see "Welcome cbu-tester" within 5 seconds

    Scenario: I create a test project @CBU-ALL @CBU-E
        Given I click "Welcome cbu-tester"
        And I click "Create a project"
        And I fill in field with id "project_name" with a random name identified by "E-test-project-name"
        And I fill in field with id "project_description" with random text identified by "E-test-project-description" and length "20"
        And I fill in field with id "project_location" with "10003"
        And I press "Create"
        Then I should see the text identified by "E-test-project-name"

    Scenario: Posting project update to Twitter @CBU-ALL @CBU-E
        Given I go to "http://testing.v3.changeby.us"
        And I press "View Dashboard"
        And I press "All Projects"
        And I click the text identified by "E-test-project-name"
        And I press "Members Only"
        And I click "Twitter"
        And I fill in field with id "title-field" with a random name identified by "E-test-twitter-post-name"
        And I fill in field with id "update-field" with random text identified by "E-test-twitter-post-text" and length "20"
        And I press "Post"
        And I see "Posted Successfully to Twitter"
        And I press "Close"
        Then I should see the text identified by "E-test-twitter-post-name"

    Scenario: Logging out @CBU-ALL @CBU-E
        Given I go to "http://testing.v3.changeby.us"
        And I click "Welcome cbu-tester"
        And I click "Log Out"
        Then I should see "Sign Up"

    Scenario: Verifying post on Twitter @CBU-ALL @CBU-E
        Given I go to "https://twitter.com/cbutester"
        Then I should see the text identified by "E-test-twitter-post-name"
