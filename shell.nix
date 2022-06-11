with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "cerus";
    buildInputs = [
        nodejs-16_x tilt minikube android-udev-rules android-tools python2 kubectl kubernetes-helm bind
    ];
}
