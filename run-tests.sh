#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
readonly ENV="test"
source "$repository/scripts/common.sh"

function main() {
    required_command npm

    pushd "$repository"

    echo "::group::Installing node and dependencies"
    check_node_version
    npm_ci
    npm run test:install
    echo "::endgroup::"

    get_environment_variables

    echo "::group::Running tests"
    npm run test
    echo "::endgroup::"

    popd
}

main "$@"