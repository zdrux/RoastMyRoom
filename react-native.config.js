// Ensure RN gradle plugin can read the Android package name for autolinking
module.exports = {
  project: {
    android: {
      packageName: 'com.roastmyroom.app'
    }
  }
}

