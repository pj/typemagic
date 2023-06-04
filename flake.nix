{
  description = "Dependencies for repo management test";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let 
        pkgs = nixpkgs.legacyPackages.${system};
        deps = rec {
                node = pkgs.nodejs_20;
                default = node;
            }; 
        in 
        {
            packages = deps;
            devShells = rec {
              default = pkgs.mkShell { packages = pkgs.lib.attrsets.attrValues deps; };
            };
        }
      );
}
