#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# LP Internal Testing Structure
# Derived from https://github.com/blossom/lettuce-webdriver-setup
# Under the GNU Public License
#
# The lettuce webdriver syntax is listed here
# https://github.com/bbangert/lettuce_webdriver


import optparse
import os
import sys
import lettuce
from selenium import webdriver
from lettuce.terrain import world

# TODO it looks like this bin has become a native part of lettuce
# we should move towards the native

def main(args=sys.argv[1:]):
    # modified base path to run test/features instead of features
    base_path = os.path.join(os.path.dirname(os.curdir), 'test', 'features')
    parser = optparse.OptionParser(
        usage="%prog or type %prog -h (--help) for help",
        version=lettuce.version)

    parser.add_option("-v", "--verbosity",
                      dest="verbosity",
                      default=4,
                      help='The verbosity level')

    # TODO add in more browsers
    parser.add_option("-b", "--browser",
                      help="Choose the browser to run these tests under",
                      choices=['chrome', 'firefox'])

    parser.add_option("-s", "--scenarios",
                      dest="scenarios",
                      default=None,
                      help='Comma separated list of scenarios to run')

    parser.add_option("-t", "--tag",
                      dest="tags",
                      default=None,
                      action='append',
                      help='Tells lettuce to run the specified tags only; '
                      'can be used multiple times to define more tags'
                      '(prefixing tags with "-" will exclude them and '
                      'prefixing with "~" will match approximate words)')

    parser.add_option("-r", "--random",
                      dest="random",
                      action="store_true",
                      default=False,
                      help="Run scenarios in a more random order to avoid interference")

    parser.add_option("--with-xunit",
                      dest="enable_xunit",
                      action="store_true",
                      default=False,
                      help='Output JUnit XML test results to a file')

    parser.add_option("--xunit-file",
                      dest="xunit_file",
                      default=None,
                      type="string",
                      help='Write JUnit XML to this file. Defaults to '
                      'lettucetests.xml')

    parser.add_option("--failfast",
                      dest="failfast",
                      default=False,
                      action="store_true",
                      help='Stop running in the first failure')

    parser.add_option("--pdb",
                      dest="auto_pdb",
                      default=False,
                      action="store_true",
                      help='Launches an interactive debugger upon error')

    options, args = parser.parse_args(args)
    if args:
        base_path = os.path.abspath(args[0])

    try:
        options.verbosity = int(options.verbosity)
    except ValueError:
        pass


    tags = None
    if options.tags:
        tags = [tag.strip('@') for tag in options.tags]

    runner = lettuce.Runner(
        base_path,
        scenarios=options.scenarios,
        verbosity=options.verbosity,
        random=options.random,
        enable_xunit=options.enable_xunit,
        xunit_filename=options.xunit_file,
        failfast=options.failfast,
        auto_pdb=options.auto_pdb,
        tags=tags,
    )

    if options.browser == 'chrome':
      world.browser = webdriver.Chrome()
    elif options.browser == 'firefox':
      world.browser = webdriver.Firefox()
    else:
      world.browser = None
    
    
    result = runner.run()
    failed = result is None or result.steps != result.steps_passed
    raise SystemExit(int(failed))

if __name__ == '__main__':
    main()

