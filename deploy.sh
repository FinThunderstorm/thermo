#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
readonly infra_dir="$repository/infra"
readonly deploy_dir="$repository/deploy"
readonly ENV="prod"

source "$repository/scripts/common.sh"

function main {
  required_command tofu
  check_node_version
  get_environment_variables

  echo ::group::Initialize Terraform using OpenTofu
  pushd "$infra_dir"
  tofu init -input=false
  popd
  pushd "$deploy_dir"
  tofu init -input=false
  popd
  echo ::endgroup::

  echo ::group::Apply the infrastructure
  pushd "$infra_dir"
  tofu apply -input=false -auto-approve
  export TF_VAR_bucket_id=$(tofu output -raw bucket_id)
  export AWS_REGION=$(tofu output -raw aws_region)
  export AUTH_CLIENT_ID=$(tofu output -raw auth_user_pool_app_client_id)
  popd
  echo ::endgroup::

  echo ::group::Build the application
  npm_ci
  npm run build
  echo ::endgroup::

  echo ::group::Deploy the application
  pushd "$deploy_dir"
  tofu apply -input=false -auto-approve
  popd
  echo ::endgroup::
  }

main "$@"