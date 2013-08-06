# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: CBU Home Page @CBU-ALL @CBU-F
    Given I link my twitter account to CBU
    I should be able to log in to CBU
    And I should be able to post to twitter
    Then I should see my post on twitter

    Scenario: The home page exists @CBU-ALL @CBU-F
        Given I go to "http://testing.v3.changeby.us/"
        And I see the browser title is "Change By Us"
        And I see an image with source "/static/img/icon_promote.png"
        And I see "Active Projects"
        Then I should see a link that contains the text "Sign" and the url "#signupModal"

    Scenario: Attempting to create an account by over-filling text input fields @CBU-ALL @CBU-F
        Given I go to "http://testing.v3.changeby.us/signup#"
        And I see "Please log in before continuing!"
        And I fill in field with id "signup-display-name" with a random name identified by "F-test-username" and length "500"
        And I fill in field with id "signup-first-name" with a random name identified by "F-test-first-name" and length "550"
        And I fill in field with id "signup-last-name" with a random name identified by "F-test-last-name" and length "450"
        And I fill in field with id "signup-email" with a random email identified by "F-test-email" and length "600"
        And I fill in field with id "signup-password" with a random password identified by "F-test-password" and length "575"
        And I press "Sign Up"
        Then I should see "Welcome A-Tester"