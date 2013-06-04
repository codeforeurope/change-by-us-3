from lettuce import *
from lettuce_webdriver.util import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from datetime import datetime, timedelta
from tools import *
import unittest, time, re
import requests

def find_field_by_id(browser, attribute):
    xpath = "//input[@id='%s']" % attribute
    elems = browser.find_elements_by_xpath(xpath)
    return elems[0] if elems else False

def find_textarea_by_id(browser, attribute):
    xpath = "//textarea[@id='%s']" % attribute
    elems = browser.find_elements_by_xpath(xpath)
    return elems[0] if elems else False

def find_textarea_by_class(browser, attribute):
    xpath = "//textarea[@class='%s']" % attribute
    elems = browser.find_elements_by_xpath(xpath)
    return elems[0] if elems else False

def find_cell_by_class(browser, attribute):
    xpath = "//td[@class='%s']" % attribute
    elems = browser.find_elements_by_xpath(xpath)
    return elems[0] if elems else False

def find_field_by_type(browser, attribute):
    xpath = "//input[@type='%s']" % attribute
    elems = browser.find_element_by_xpath(xpath)
    return elems

def find_input_by_name(browser, attribute):
    xpath = "//input[@name='%s']" % attribute
    elems = browser.find_element_by_xpath(xpath)
    return elems

@step('I fill in field with xpath "(.*?)" with "(.*?)"')
def fill_in_field_with_xpath(step, xpath, value):
    with AssertContextManager(step):
        elems = world.browser.find_element_by_xpath(xpath)
    elems.clear()
    elems.send_keys(value)

@step('I fill in field with id "(.*?)" with "(.*?)"')
def fill_in_field_with_id(step, field_id, value):
    with AssertContextManager(step):
        elems = find_field_by_id(world.browser, field_id)
        elems.clear()
        elems.send_keys(value)

@step('I fill in textarea with id "(.*?)" with "(.*?)"')
def fill_in_textarea_with_id(step, textarea_id, value):
    with AssertContextManager(step):
        elems = find_textarea_by_id(world.browser, textarea_id)
        elems.clear()
        elems.send_keys(value)

@step('I fill in textarea with class "(.*?)" with "(.*?)"')
def fill_in_textarea_with_class(step, textarea_class, value):
    with AssertContextManager(step):
        elems = find_textarea_by_class(world.browser, textarea_class)
        elems.clear()
        elems.send_keys(value)

@step('I fill in field with class "(.*?)" with "(.*?)"')
def fill_in_textfield_by_class(step, field_name, value):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with name "(.*?)" with "(.*?)"')
def fill_in_textfield_by_name(step, name, value):
    with AssertContextManager(step):
        text_field = find_field_by_name(world.browser, name)
        assert_false(step, text_field is False,'Cannot find a field named "%s"' % name)
        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with type "(.*?)" with "(.*?)"')
def fill_in_textfield_by_type(step, field_type, value):
    with AssertContextManager(step):
        text_field = find_field_by_type(world.browser, field_type)
        assert_false(step, text_field is False,'Can not find a field with type "%s"' % field_type)
        text_field.clear()
        text_field.send_keys(value)

@step('I select "(.*?)" from the dropdown "(.*?)"')
def select_from_dropdown(step, name, dropdown):
    with AssertContextManager(step):
        Select(world.browser.find_element_by_css_selector("select")).select_by_visible_text("Memorial Exhibition")
        world.browser.find_element_by_css_selector("option[value=\"memex\"]").click()

@step('I fill in "(.*?)" with tomorrow')
def fill_in_field_with_tomorrow(step, field_name):
    now = datetime.now()
    future = datetime.now() + timedelta(days=1)
    dateFuture = future.strftime("%m/%d/%Y")
    fill_in_textfield_by_class(step, field_name, dateFuture)

@step('I click element with id "(.*?)"')
def click_element_with_id(step, element_id):
    world.browser.find_element_by_id(element_id).click()

@step('I click element with class "(.*?)"')
def click_element_with_class(step, element_class):
    world.browser.find_cell_by_class(element_class).click()

@step('I fill in search-box "(.*?)" with "(.*?)"')
def fill_in_search_box_with_text(step, search_box, text):
    searchBox = world.browser.find_element_by_xpath("//div[@class='%s']" % search_box)
    searchBox.find_element_by_css_selector("input[type=\"text\"]").clear()
    searchBox.find_element_by_css_selector("input[type=\"text\"]").send_keys(text)

@step('I click link with xpath "(.*?)"')
def click_link_with_xpath(step, xpath):
    world.browser.find_element_by_xpath(xpath).click()

@step('I see an image with source "(.*?)"')
def see_image_with_source(step, source):
    element = world.browser.find_element_by_xpath('//img[@src="%s"]' % source)
    assert_true(step, element is not None)

@step('I should see an image with source "(.*?)"')
def should_see_image_with_source(step, source):
    element = world.browser.find_element_by_xpath('//img[@src="%s"]' % source)
    assert_true(step, element is not None)

@step('I see the browser title is "(.*?)"')
def see_browser_title_is(step, title):
    element = world.browser.title
    assert_true(step, title in element)

@step('I see a link that contains the text "(.*?)" and the url "(.*?)"')
def see_include_link_text(step, link_text, link_url):
    return world.browser.find_element_by_xpath('//a[@href="%s"][contains(., %s)]' %
        (link_url, link_text))

@step('I click the link that contains the url "(.*?)"')
def click_link_url(step, link_url):
    element = world.browser.find_element_by_xpath('//a[@href="%s"]' % link_url)
    element.click()


@step('I fill in field with id "(.*?)" with a random password identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, password_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with a random password identified by "(.*?)" and length "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier, length):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, password_generator(int(length)))
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with random text identified by "(.*?)" and length "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier, length):
    with AssertContextManager(step):
        text_field = find_textarea_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, text_generator(int(length)))
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)


@step('I fill in field with id "(.*?)" with a random name identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, name_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with a random name identified by "(.*?)" and length "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier, length):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, name_generator(int(length)))
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with a random email identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, email_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with a random email identified by "(.*?)" and length "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier, length):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, email_generator(int(length)))
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with random unicode identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, unicode_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in textarea with id "(.*?)" with random unicode identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_textarea_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, unicode_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I fill in field with id "(.*?)" with a random unicode email identified by "(.*?)"')
def fill_in_textfield_by_class(step, field_name, identifier):
    with AssertContextManager(step):
        text_field = find_field_by_id(world.browser, field_name)
        assert_false(step, text_field is False,'Can not find a field named "%s"' % field_name)
        text_field.clear()

        identifier = identifier.replace(' ', '-')

        if not hasattr(world, identifier):
            setattr(world, identifier, unicode_email_generator())
        value = getattr(world, identifier)

        text_field.clear()
        text_field.send_keys(value)

@step('I see the text identified by "(.*?)"')
def see(step, identifier):
    with AssertContextManager(step):
        identifier = identifier.replace(' ', '-')

        assert_true(step, hasattr(world, identifier))
        text = getattr(world, identifier)

        assert_true(step, contains_content(world.browser, text))

@step('I should see the text identified by "(.*?)"')
def see(step, identifier):
    with AssertContextManager(step):
        identifier = identifier.replace(' ', '-')

        assert_true(step, hasattr(world, identifier))
        text = getattr(world, identifier)

        assert_true(step, contains_content(world.browser, text))

@step('I should not see the text identified by "(.*?)"')
def should_not_see(step, identifier):
    with AssertContextManager(step):
        identifier = identifier.replace(' ', '-')

        assert_true(step, hasattr(world, identifier))
        text = getattr(world, identifier)

        assert_false(step, contains_content(world.browser, text))

@step('I click the text identified by "(.*?)"')
def click(step, identifier):
    with AssertContextManager(step):
        identifier = identifier.replace(' ', '-')

        assert_true(step, hasattr(world, identifier))
        text = getattr(world, identifier)

        elem = world.browser.find_element_by_link_text(text)
        elem.click()

@step('I click the text identified by "(.*?)" plus a space')
def click(step, identifier):
    with AssertContextManager(step):
        identifier = identifier.replace(' ', '-')

        assert_true(step, hasattr(world, identifier))
        text = getattr(world, identifier) + " "

        elem = world.browser.find_element_by_link_text(text)
        elem.click()

@step('I take a picture of the screen named "(.*?).png"')
def take_photo(step, photo_name):
    with AssertContextManager(step):
        world.browser.save_screenshot(photo_name+'.png')

def contains_content(browser, content):
    for elem in browser.find_elements_by_xpath('//*[text()]'):
        # hypothetically it should be possible to make this request using
        # a contains() predicate, but that doesn't seem to behave properly
        if elem.is_displayed() and content in elem.text:
            return True

    return False
