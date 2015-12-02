angular.module('myApp.techlistService', [])

.service('techList', function() {
  this.techList = [
  "AWS", "ActionScript", "AngularJS", "Arduino", "Backbone", "Bison",
  "Bootstrap", "Bower", "C", "C#", "C++", "CSS", "CoffeeScript", "Dart",
  "Django", "Docker", "Drupal", "Elm", "Emacs", "Ember", "Erlang",
  "Express", "Facebook-API", "Firebase", "Foundation", "Github-API", "Go",
  "Google-API", "Grunt", "Gulp", "HTML", "Haskell", "Haxe", "Heroku",
  "Ionic", "Java", "JavaScript", "Laravel", "Less", "LinkedIn-API", "Linux",
  "Lua", "Makefile", "Material-UI", "Meteor", "MySQL", "Neo4j", "Node.js",
  "OCaml", "Objective-C", "PHP", "PostgreSQL", "PowerShell", "Processing",
  "Puppet", "Python", "Rails", "React", "Redis", "Ruby", "Rust", "SQLite",
  "Sass", "Scala", "Shell", "Stylus", "Swift", "Symfony", "Tcl", "TypeScript",
  "VimL", "Wordpress", "Zend", "jQuery", "mongoDB", "socket.io"
  ];

  this.getTechList = function() {
        return this.techList;
  };
})

;