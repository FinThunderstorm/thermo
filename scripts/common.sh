#!/usr/bin/env bash
function validate_env() {
    echo "::debug::Validating \$ENV=${ENV}"
    if [[ -z "${ENV:-}" ]]
    then
        echo "::error title={"ENV"}::\$ENV is not set. Exiting."
        exit 1
    fi

    if [[ "$ENV" != "dev" && "$ENV" != "test" && "$ENV" != "prod" ]]
    then
        echo "::error title={"ENV"}::\$ENV is not set to dev, test, or production. Exiting."
        exit 1
    fi
}

validate_env # be sure that env is correctly set as other functions depend on it

readonly repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd)"

function check_node_version() {
    pushd "$repository"
    echo "::debug::Setting up right Node version"

    # This will use always repo provided nvm if nvm is not in PATH etc.
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    source "./scripts/nvm.sh"
    nvm use || nvm install

    popd
}

function required_command() {
    if ! command -v $1 &> /dev/null
    then
        echo "$1 could not be found"
        exit
    fi
}

function npm_ci() {
    pushd "$repository"
    echo "::debug::Installing dependencies with npm ci"

    required_command shasum

    # check if shashum is same, do not run npm ci
    if shasum -c "node_modules/package-lock.json.sha1" &> /dev/null
    then
        echo "package-lock.json has not changed, no need for npm ci"
    else
        echo "package-lock.json has changed, running npm ci"

        NODE_ENV=${1:-development} npm ci

        shasum "package-lock.json" > "node_modules/package-lock.json.sha1"
    fi

    popd
}

function get_environment_variables() {
    if [[ "$ENV" == "dev" ]]
    then
        export PORT=${PORT:-"4000"}
        export APP_ENV="development"
        export NODE_ENV="development"
    elif [[ "$ENV" == "test" ]]
    then
        export PORT=${PORT:-"4010"}
        export APP_ENV="development"
        export NODE_ENV="test"
    else
        export PORT=${PORT:-"4020"}
        export APP_ENV="production"
        export NODE_ENV="production"
    fi
}
