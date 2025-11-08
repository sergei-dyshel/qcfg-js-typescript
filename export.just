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
    set -o pipefail
    set -e

    echo "Running modified tests"
    qcfg-build test --if-built --delete-if-fails $(find . -name '*.test.ts')
    echo "Running tests marked as 'only'"
    if qcfg-build test --only --reporter tap $(find . -name '*.test.ts') | grep '^ok ' | grep -v '^ok .*\.test$'; then
        echo "Found test files with tests marked as 'only'"
        exit 1
    fi

[no-cd]
test-force:
    #!/usr/bin/env bash
    shopt -s globstar
    qcfg-build test --force **/*.test.ts

[no-cd]
compile:
    tsc --noEmit
