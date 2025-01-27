chrome.storage.sync.get("familyGroup", (result) => {
  if (
    result.familyGroup &&
    $("body.profile").length &&
    window.location.href.match("Space:") == null
  ) {
    // Add a link to the short list of links below the tabs
    const options = {
      title: "Display family group dates and locations",
      id: "familyGroupButton",
      text: "Family Group",
      url: "#n",
    };
    createProfileSubmenuLink(options);
    $("#" + options.id).click(function (e) {
      e.preventDefault();
      const profileID = $("a.pureCssMenui0 span.person").text();
      showFamilySheet($(this)[0], profileID);
    });

    async function showFamilySheet(theClicked, profileID) {
      // If the table already exists toggle it.
      if ($("#" + profileID.replace(" ", "_") + "_family").length) {
        $("#" + profileID.replace(" ", "_") + "_family").fadeToggle();
      } else {
        // Make the table and do other things
        getRelatives(profileID).then((person) => {
          uPeople = familyArray(person);
          // Make the table
          familyTable = peopleToTable(uPeople);
          // Attach the table to the body, position it and make it draggable and toggleable
          familyTable.prependTo("body");
          familyTable.attr("id", profileID.replace(" ", "_") + "_family");
          familyTable.draggable();
          familyTable.on("dblclick", function () {
            $(this).fadeOut();
          });
          theLeft = getOffset($("div.ten.columns")[0]).left;
          familyTable.css({
            top: getOffset(theClicked).top + 50,
            left: theLeft,
          });
          // Adjust the position of the table on window resize
          $(window).resize(function () {
            if (familyTable.length) {
              theLeft = getOffset($("div.ten.columns")[0]).left;
              familyTable.css({
                top: getOffset(theClicked).top + 50,
                left: theLeft,
              });
            }
          });

          $(".familySheet x").unbind();
          $(".familySheet x").click(function () {
            $(this).parent().fadeOut();
          });
          $(".familySheet w").unbind();
          $(".familySheet w").click(function () {
            $(this).parent().toggleClass("wrap");
          });
        });
      }
    }

    // Put a group of people in a table
    function peopleToTable(kPeople) {
      kTable = $(
        "<div class='familySheet'><w>↔</w><x>x</x><table><caption></caption><thead><tr><th>Relation</th><th>Name</th><th>Birth Date</th><th>Birth Place</th><th>Death Date</th><th>Death Place</th></tr></thead><tbody></tbody></table></div>"
      );
      kPeople.forEach(function (kPers) {
        rClass = "";
        isDecades = false;
        kPers.RelationShow = kPers.Relation;
        if (kPers.Relation == undefined || kPers.Active) {
          kPers.Relation = "Sibling";
          kPers.RelationShow = "";
          rClass = "self";
        }

        if (kPers.BirthDate) {
          bDate = kPers.BirthDate;
        } else if (kPers.BirthDateDecade) {
          bDate = kPers.BirthDateDecade.slice(0, -1) + "-00-00";
          isDecades = true;
        } else {
          bDate = "0000-00-00";
        }

        if (kPers.DeathDate) {
          dDate = kPers.DeathDate;
        } else if (kPers.DeathDateDecade) {
          if (kPers.DeathDateDecade == "unknown") {
            dDate = "0000-00-00";
          } else {
            dDate = kPers.DeathDateDecade.slice(0, -1) + "-00-00";
          }
        } else {
          dDate = "0000-00-00";
        }

        if (kPers.BirthLocation == null || kPers.BirthLocation == undefined) {
          kPers.BirthLocation = "";
        }

        if (kPers.DeathLocation == null || kPers.DeathLocation == undefined) {
          kPers.DeathLocation = "";
        }

        if (kPers.MiddleName == null) {
          kPers.MiddleName = "";
        }
        oName = displayName(kPers)[0];

        if (kPers.Relation) {
          // The relation is stored as "Parents", "Spouses", etc., so...
          kPers.Relation = kPers.Relation.replace(/s$/, "").replace(/ren$/, "");
          if (rClass != "self") {
            kPers.RelationShow = kPers.Relation;
          }
        }
        if (oName) {
          oBDate = ymdFix(bDate);
          oDDate = ymdFix(dDate);
          if (isDecades == true) {
            oBDate = kPers.BirthDateDecade;
            if (oDDate != "") {
              oDDate = kPers.DeathDateDecade;
            }
          }
          aLine = $(
            "<tr data-name='" +
              kPers.Name +
              "' data-birthdate='" +
              bDate.replaceAll(/\-/g, "") +
              "' data-relation='" +
              kPers.Relation +
              "' class='" +
              rClass +
              " " +
              kPers.Gender +
              "'><td>" +
              kPers.RelationShow +
              "</td><td><a href='https://www.wikitree.com/wiki/" +
              htmlEntities(kPers.Name) +
              "'>" +
              oName +
              "</td><td class='aDate'>" +
              oBDate +
              "</td><td>" +
              kPers.BirthLocation +
              "</td><td class='aDate'>" +
              oDDate +
              "</td><td>" +
              kPers.DeathLocation +
              "</td></tr>"
          );

          kTable.find("tbody").append(aLine);
        }

        if (kPers.Relation == "Spouse") {
          marriageDeets = "m.";
          dMdate = ymdFix(kPers.marriage_date);
          if (dMdate != "") {
            marriageDeets += " " + dMdate;
          }
          if (isOK(kPers.marriage_location)) {
            marriageDeets += " " + kPers.marriage_location;
          }
          if (marriageDeets != "m.") {
            if (kPers.DataStatus.Gender == "blank") {
              kGender = "";
            } else {
              kGender = kPers.Gender;
            }
            spouseLine = $(
              "<tr class='marriageRow " +
                kGender +
                "' data-spouse='" +
                kPers.Name +
                "'><td>&nbsp;</td><td colspan='3'>" +
                marriageDeets +
                "</td><td></td><td></td></tr>"
            );
            kTable.find("tbody").append(spouseLine);
          }
        }
      });
      rows = kTable.find("tbody tr");
      rows.sort((a, b) =>
        $(b).data("birthdate") < $(a).data("birthdate") ? 1 : -1
      );
      kTable.find("tbody").append(rows);

      familyOrder = ["Parent", "Sibling", "Spouse", "Child"];
      familyOrder.forEach(function (relWord) {
        kTable.find("tr[data-relation='" + relWord + "']").each(function () {
          $(this).appendTo(kTable.find("tbody"));
        });
      });

      kTable.find(".marriageRow").each(function () {
        $(this).insertAfter(
          kTable.find("tr[data-name='" + $(this).data("spouse") + "']")
        );
      });

      return kTable;
    }

    // Find good names to display (as the API doesn't return the same fields all profiles)
    function displayName(fPerson) {
      if (fPerson != undefined) {
        fName1 = "";
        if (typeof fPerson["LongName"] != "undefined") {
          if (fPerson["LongName"] != "") {
            fName1 = fPerson["LongName"].replace(/\s\s/, " ");
          }
        }
        fName2 = "";
        fName4 = "";
        if (typeof fPerson["MiddleName"] != "undefined") {
          if (
            fPerson["MiddleName"] == "" &&
            typeof fPerson["LongNamePrivate"] != "undefined"
          ) {
            if (fPerson["LongNamePrivate"] != "") {
              fName2 = fPerson["LongNamePrivate"].replace(/\s\s/, " ");
            }
          }
        } else {
          if (typeof fPerson["LongNamePrivate"] != "undefined") {
            if (fPerson["LongNamePrivate"] != "") {
              fName4 = fPerson["LongNamePrivate"].replace(/\s\s/, " ");
            }
          }
        }

        fName3 = "";
        checks = [
          "Prefix",
          "FirstName",
          "RealName",
          "MiddleName",
          "LastNameAtBirth",
          "LastNameCurrent",
          "Suffix",
        ];
        checks.forEach(function (dCheck) {
          if (typeof fPerson["" + dCheck + ""] != "undefined") {
            if (
              fPerson["" + dCheck + ""] != "" &&
              fPerson["" + dCheck + ""] != null
            ) {
              if (dCheck == "LastNameAtBirth") {
                if (fPerson["LastNameAtBirth"] != fPerson.LastNameCurrent) {
                  fName3 += "(" + fPerson["LastNameAtBirth"] + ") ";
                }
              } else if (dCheck == "RealName") {
                if (typeof fPerson["FirstName"] != "undefined") {
                } else {
                  fName3 += fPerson["RealName"] + " ";
                }
              } else {
                fName3 += fPerson["" + dCheck + ""] + " ";
              }
            }
          }
        });

        arr = [fName1, fName2, fName3, fName4];
        var longest = arr.reduce(function (a, b) {
          return a.length > b.length ? a : b;
        });

        fName = longest;

        if (fPerson["ShortName"]) {
          sName = fPerson["ShortName"];
        } else {
          sName = fName;
        }
        // fName = full name; sName = short name
        return [fName.trim(), sName.trim()];
      }
    }

    // Convert dates to ISO format (YYYY-MM-DD)
    function ymdFix(date) {
      if (date == undefined || date == "") {
        outDate = "";
      } else {
        dateBits1 = date.split(" ");
        if (dateBits1[2]) {
          sMonths = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          lMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          dMonth = date.match(/[A-z]+/i);
          if (dMonth != null) {
            sMonths.forEach(function (aSM, i) {
              if (
                dMonth[0].toLowerCase() == aSM.toLowerCase() ||
                dMonth[0].toLowerCase() == aSM + ".".toLowerCase()
              ) {
                dMonthNum = (i + 1).toString().padStart(2, "0");
              }
            });
          }
          dDate = date.match(/\b[0-9]{1,2}\b/);
          dDateNum = dDate[0];
          dYear = date.match(/\b[0-9]{4}\b/);
          dYearNum = dYear[0];
          return dYearNum + "-" + dMonthNum + "-" + dDateNum;
        } else {
          dateBits = date.split("-");
          outDate = date;
          if (dateBits[1] == "00" && dateBits[2] == "00") {
            if (dateBits[0] == "0000") {
              outDate = "";
            } else {
              outDate = dateBits[0];
            }
          }
        }
      }
      return outDate;
    }

    // Replace certain characters with HTML entities
    function htmlEntities(str) {
      return String(str)
        .replaceAll(/&/g, "&amp;")
        .replaceAll(/</g, "&lt;")
        .replaceAll(/>/g, "&gt;")
        .replaceAll(/"/g, "&quot;")
        .replaceAll(/'/g, "&apos;");
    }

    // Get the position of an element
    function getOffset(el) {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    }
  }
});
