/*
 Version#s reflect the version of the data model. In the versions enum, the count of versions should always be n+1
 where n is the number of released versions. The last version is reserved for in-development changes that have not
 yet been released. Naming convention for version#s is v0, v1, v2, etc. and the assigned value should be the same as
 the index of the version in the enum.
 
 VERSION UPDATE PROCESS
 
 1. As soon as a change to the data model is made, update the dirty flag in the comment below.
 2. When making a GA release of WISP (deploying to web server), if the dirty flag is set: 
    a. add a new version to the versions enum.
    b. update the CURRENT_DATA_VERSION to the new version.
    c. update the dirty flag to NO.
    
 TODO add instructions for maintaining chained upgrades.
 
 DIRTY FLAG
 
 Does the data model have changes that have not yet been released? YES
 
 WISP PROJECT FORKS
 
 If you fork WISP and make changes to the data model, you'll effectively be creating a new data format for your flavor
 of WISP. This could get really confusing when importing/exporting and lead to users experiencing data loss. To avoid this,
 make some breaking change to the name of the project file in keyPaths.ts, e.g. /projects/PROJECT NAME/project2. 
 This will cause your format to be clearly incompatible with the WISP format supported by the original project and generate
 clean import failures. */

enum versions {
    v0
}

// This should always be set to the last version number in the enum above.
export const CURRENT_DATA_VERSION = versions.v0; 

export default versions;