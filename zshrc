find-up () {
  path=$(pwd)
  while [[ "$path" != "" && ! -e "$path/$1" ]]; do
    path=${path%/*}
  done
  echo "$path"
}

bt () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && pnpm run build --filter=$PKG_NAME... "$@")
}

tt () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && pnpm run test --filter=$PKG_NAME...)
}

ba () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && pnpm run build )
}

ba-remote () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && npx turbo build --remote-only )
}

ta () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && pnpm run test )
}

ta-remote () {
    ROOT_DIR=$(find-up "pnpm-workspace.yaml")
    PKG_NAME=$(npm pkg get name | sed -e s#\"##g)
    (cd $ROOT_DIR && npx turbo test --remote-only )
}

