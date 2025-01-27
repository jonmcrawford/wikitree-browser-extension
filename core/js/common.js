if (
  window.location.pathname.match(/(\/wiki\/)\w[^:]*-[0-9]*/g) ||
  window.location.href.match(/\?title\=\w[^:]+-[0-9]+/g)
) {
  // Is a Profile Page
  var pageProfile = true;
} else if (window.location.pathname.match(/(\/wiki\/)Help:*/g)) {
  // Is a Help Page
  var pageHelp = true;
} else if (window.location.pathname.match(/(\/wiki\/)Special:*/g)) {
  // Is a Special Page
  var pageSpecial = true;
} else if (window.location.pathname.match(/(\/wiki\/)Category:*/g)) {
  // Is a Category Page
  var pageCategory = true;
} else if (window.location.pathname.match(/(\/wiki\/)Template:*/g)) {
  // Is a Template Page
  var pageTemplate = true;
} else if (window.location.pathname.match(/(\/wiki\/)Space:*/g)) {
  // Is a Space Page
  var pageSpace = true;
} else if (window.location.pathname.match(/\/g2g\//g)) {
  // Is a G2G page
  var pageG2G = true;
}

// Add wte class to body to let WikiTree BEE know not to add the same functions
document.querySelector("body").classList.add("wte");

/**
 * Creates a new menu item in the Apps dropdown menu.
 *
 */
function createTopMenuItem(options) {
  let title = options.title;
  let name = options.name;
  let id = options.id;
  let url = options.url;

  $("#wte-topMenu").append(`<li>
        <a id="${id}" class="pureCssMenui" title="${title}">${name}</a>
    </li>`);
}

// Add a link to the short list of links below the tabs
function createProfileSubmenuLink(options) {
  $("ul.views.viewsm")
    .eq(0)
    .append(
      $(
        `<li class='viewsi'><a title='${options.title}' href='${options.url}' id='${options.id}'>${options.text}</a></li>`
      )
    );
  let links = $("ul.views.viewsm:first li");
  // Re-sort the links into alphabetical order
  links.sort(function (a, b) {
    return $(a).text().localeCompare($(b).text());
  });
  $("ul.views.viewsm").eq(0).append(links);
}

function createTopMenu() {
  newUL = $("<ul class='pureCssMenu' id='wte-topMenuUL'></ul>");
  $("ul.pureCssMenu").eq(0).after(newUL);
  newUL.append(`<li>
        <a class="pureCssMenui0">
            <span>App Features</span>
        </a>
        <ul class="pureCssMenum" id="wte-topMenu"></ul>
    </li>`);
}

// Used in familyTimeline, familyGroup, locationsHelper
async function getRelatives(id, fields = "*") {
  try {
    const result = await $.ajax({
      url: "https://api.wikitree.com/api.php",
      crossDomain: true,
      xhrFields: { withCredentials: true },
      type: "POST",
      dataType: "json",
      data: {
        action: "getRelatives",
        keys: id,
        fields: fields,
        getParents: 1,
        getSiblings: 1,
        getSpouses: 1,
        getChildren: 1,
      },
    });
    return result[0].items[0].person;
  } catch (error) {
    console.error(error);
  }
}

// Used in familyTimeline, familyGroup, locationsHelper
// Make the family member arrays easier to handle
function extractRelatives(rel, theRelation = false) {
  let people = [];
  if (typeof rel == undefined || rel == null) {
    return false;
  }
  pKeys = Object.keys(rel);
  pKeys.forEach(function (pKey) {
    var aPerson = rel[pKey];
    if (theRelation != false) {
      aPerson.Relation = theRelation;
    }
    people.push(aPerson);
  });
  return people;
}

// Used in familyTimeline, familyGroup, locationsHelper
function familyArray(person) {
  // This is a person from getRelatives()
  const rels = ["Parents", "Siblings", "Spouses", "Children"];
  let familyArr = [person];
  rels.forEach(function (rel) {
    relation = rel.replace(/s$/, "").replace(/ren$/, "");
    familyArr = familyArr.concat(extractRelatives(person[rel], relation));
  });
  return familyArr;
}

// Check that a value is OK
// Used in familyTimeline and familyGroup
function isOK(thing) {
  excludeValues = [
    "",
    null,
    "null",
    "0000-00-00",
    "unknown",
    "Unknown",
    "undefined",
    undefined,
    "0000",
    "0",
    0,
  ];
  if (!excludeValues.includes(thing)) {
    if (isNumeric(thing)) {
      return true;
    } else {
      if (jQuery.type(thing) === "string") {
        nanMatch = thing.match(/NaN/);
        if (nanMatch == null) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}
