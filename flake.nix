{
  description = "Dependencies for repo management test";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs = { self, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.aarch64-darwin;
      deps = rec {
        node = pkgs.nodejs_20
        default = node;
      };
    in
      {
        packages.aarch64-darwin = deps;
        devShells.aarch64-darwin.default = pkgs.mkShell { packages = pkgs.lib.attrsets.attrValues deps; };
      };
}
