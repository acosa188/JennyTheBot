function removeSpaces(args){
  var tempArgs = args;
  var spaceIndex = 1;
  while(args[spaceIndex] == ''){
      spaceIndex++;
  }

  for(var i = spaceIndex - 1; i > 0; i--){
    tempArgs.splice(i, 1);
  }
  return tempArgs;
}
