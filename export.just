# Run cyclic dependency checker on all files
[no-cd]
dpdm:
    #!/usr/bin/env bash
    shopt -s globstar
    dpdm --exit-code circular:1 --skip-dynamic-imports tree --no-warning --transform --no-tree src/**/*.ts

# Run all tests in package
[no-cd]
test:
    #!/usr/bin/env bash
    for test in $(find . -name '*.test.ts'); do
        echo "Verifying $test has no 'only' tests"
        qcfg-test -o -F $test || exit 1
    done
    ret_all=0
    for test in $(find . -name '*.test.ts'); do
        echo "Testing $test"
        qcfg-test $test
        ret=$?
        if [[ $ret -ne 0 ]]; then
            ret_all=$ret
        fi
    done
    exit $ret_all

[no-cd]
compile:
    tsc --noEmit
