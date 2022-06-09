with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "vista";
    buildInputs = [
        nodejs-16_x tilt minikube android-udev-rules android-tools python2 kubectl kubernetes-helm
    ];
    shellHooks = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        alias run="npm run"
    '';
}
