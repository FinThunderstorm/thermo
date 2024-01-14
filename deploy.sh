#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
readonly terraform_dir="$repository/terraform"
readonly ENV="prod"

source "$repository/scripts/common.sh"

function main {
  required_command tofu
  check_node_version

  echo ::group::Build static site
  pushd "$repository"
  get_environment_variables
  npm_ci
  npm run build
  popd
  echo ::endgroup::

  echo ::group::Initialize Terraform using OpenTofu
  pushd "$terraform_dir"
  tofu init -input=false
  popd
  echo ::endgroup::

  echo ::group::Apply the rest of the infrastructure with Terraform
  pushd "$terraform_dir"
  tofu apply -input=false -auto-approve
  popd
  echo ::endgroup::
  }

main "$@"