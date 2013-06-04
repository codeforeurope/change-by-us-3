# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: Signing up and logging in to CBU @CBU-ALL @CBU-A
    Given I create a new account with CBU
    And I log in with this new account
    Then I should be able to log out

    Scenario: The home page exists @CBU-ALL @CBU-A @CBU-B @CBU-C
    	Given I go to "http://testing.v3.changeby.us/"
        And I see the browser title is "Change By Us"
        And I see an image with source "/static/img/icon_promote.png"
        And I see "Active Projects"
        And I should see a link that contains the text "Sign" and the url "#signupModal"
        Then I take a picture of the screen named "main-page.png"

    Scenario: Attempt to login with wrong account @CBU-ALL @CBU-A
        Given I go to "http://testing.v3.changeby.us/signup#"
        And I see "Please log in before continuing!"
        And I fill in field with id "login-email" with a random email identified by "wrong-email-login"
        And I fill in field with id "login-password" with a random password identified by "wrong-email-password"
        And I press "Log In"
        Then I should see "Please log in before continuing!"

    Scenario: Creating an account @CBU-ALL @CBU-A @CBU-B @CBU-C
        Given I see "Please log in before continuing!"
        And I fill in field with id "signup-display-name" with a random name identified by "A-test-username"
        And I fill in field with id "signup-first-name" with "A-Tester"
        And I fill in field with id "signup-last-name" with "TesterLastname"
        And I fill in field with id "signup-email" with a random email identified by "A-test-email"
        And I fill in field with id "signup-password" with a random password identified by "A-test-password"
        And I press "Sign Up"
        Then I should see "Welcome A-Tester"

    Scenario: Logging out @CBU-ALL @CBU-A @CBU-B @CBU-C
        Given I click "Welcome A-Tester"
        And I click "Log Out"
        Then I should see an image with source "/static/img/icon_promote.png"