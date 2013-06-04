# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver

Feature: Creating a project, posting an update, creating fundraising & donating @CBU-ALL @CBU-B
    Given I create a new project
    And I post an update
    Then I should be able to set up fundraising and donate to the project

    # depends on Scenarios in CBU-A to create account A-test

    Scenario: Log In @CBU-ALL @CBU-B
        Given I go to "http://testing.v3.changeby.us/signup#"
        And I see "Please log in before continuing!"
        And I fill in field with id "login-email" with a random email identified by "A-test-email"
        And I fill in field with id "login-password" with a random password identified by "A-test-password"
        And I press "Log In"
        Then I should see "Welcome A-Tester"

    Scenario: Creating a project @CBU-ALL @CBU-B
        Given I click "Welcome A-Tester"
        And I click "Create a project"
        And I fill in field with id "project_name" with a random name identified by "B-test-project-name"
        And I fill in field with id "project_description" with random text identified by "B-test-project-description" and length "20"
        And I fill in field with id "project_location" with "10003"
        And I press "Create"
        Then I should see the text identified by "B-test-project-name"

    Scenario: Post public update @CBU-ALL @CBU-B
        Given I press "View Dashboard"
        And I press "Select Project"
        And I click the text identified by "B-test-project-name"
        And I fill in field with id "title-field" with a random name identified by "B-test-project-update-title"
        And I fill in field with id "update-field" with random text identified by "B-test-project-update-description" and length "20"
        And I press "Post"
        And I press "Close"
        Then I should see the text identified by "B-test-project-update-title"
        
    Scenario: Creating fundraising @CBU-ALL @CBU-B
        Given I click "Fundraising"
        And I press "Set Up Fundraising"
        And I press "Set Up Account with Stripe"
        And I click "Skip this account form"
        And I see the text identified by "B-test-project-name"
        And I fill in field with id "serif" with "100"
        And I fill in textarea with id "serif" with "good things"
        And I press "Save and Continue"
        And I click "Publish to Project"
        Then I should see the text identified by "B-test-project-name"

    Scenario: Donating to a project @CBU-ALL @CBU-B
        Given I click the link that contains the url "#paymentModal"
        And I fill in field with id "charge-amount" with "40"
        And I fill in field with id "charge-card-number" with "4242424242424242"
        And I fill in field with id "charge-cvc" with "675"
        And I fill in field with id "charge-email" with "tester@localprojects.net"
        And I fill in field with id "charge-expiry-month" with "10"
        And I fill in field with id "charge-expiry-year" with "2018"
        And I press "Submit Payment"
        And I should see "View Project Page" within 10 seconds
        And I click "View Project Page"
        Then I should see "$40.00 [amount donated so far]"
        
    Scenario: Logging out @CBU-ALL @CBU-B
        Given I go to "http://testing.v3.changeby.us"
        And I click "Welcome A-Tester"
        And I click "Log Out"
        Then I should see "Change in your community begins with you."

    Scenario: I make a donation to the project as an anonymous user @CBU-ALL @CBU-B
        Given I go to "http://testing.v3.changeby.us"
        And I click the text identified by "B-test-project-name"
        And I click the link that contains the url "#paymentModal"
        And I fill in field with id "charge-amount" with "50"
        And I fill in field with id "charge-card-number" with "4242424242424242"
        And I fill in field with id "charge-cvc" with "675"
        And I fill in field with id "charge-email" with "tester@localprojects.net"
        And I fill in field with id "charge-expiry-month" with "10"
        And I fill in field with id "charge-expiry-year" with "2018"
        And I press "Submit Payment"
        And I should see "View Project Page" within 10 seconds
        And I click "View Project Page"
        Then I should see "$90.00 [amount donated so far]"



