/*
	  All the stuff we need on the package-page:
    - stars
    - edits
*/

$(document).ready(function () {

  // ======= stars =======
  var packageName = $('.star').data('name'),
      starType = getPackages(packageName)

  if (starType) {
    if (starType === 'star') {
      $('.star').addClass('star-starred')
    } else {
      $('.star').removeClass('star-starred')
    }
  }

  // user clicks on the star
  $('.star').click(function (e) {
    // let's turn this into a checkbox eventually...
    e.preventDefault()
    var packages = getPackages()

    var data = {}
    data.name = $(this).data('name')
    data.isStarred = $(this).hasClass('star-starred')

    $.ajax({
      url: '/star'
    , data: JSON.stringify(data)
    , type: 'POST'
    })
    .done(function (resp) {

      if (data.isStarred) {
        $('.star').removeClass('star-starred')
        document.cookie = data.name + '=nostar' + addExpiration()
      } else {
        $('.star').addClass('star-starred')
        document.cookie = data.name + '=star' + addExpiration()
      }

    })
    .error(function (resp) {
      // we're probably not logged in
      window.location = '/login?done=/package/' + data.name
    })
  })

  // ======= edits =======
  var edit = $('.edit'),
      val, valKey, valText

  if (edit) {
    edit.click(function (e) {
      e.stopPropagation()
      valKey = $(this).data('key')
      val = $('.' + valKey)
      valText = val.text()
      // need to take out the button text
      valText = valText.slice(0, valText.indexOf('Edit')).trim()
      console.log('boom', valText)

      var textarea = '<div class="editing"><textarea name="' + valKey +
                     '" rows="3" cols="55">' + valText +
                     '</textarea><button class="ok">ok</button> ' +
                     '<button class="no">no</button></div>'

       , input = '<td class="editing"><input name="' + valKey +
                 '" value="' + valText + '"/> ' +
                 '<button class="ok">ok</button> ' +
                 '<button class="no">no</button></td>'


      val.after(valKey === 'description' ? textarea : input)
      val.hide()
      $('.editing textarea, .editing input').focus()
    })

    $('#package').on('click', '.editing', function (e) {
      e.stopPropagation()
    })

    $('#package').on('keypress', '.editing', function (e) {
      if(e.which == 13) {
        updateMetadata()
      }
    })

    $('#package').on('click', '.ok', function (e) {
      e.preventDefault()
      e.stopPropagation()
      updateMetadata()
    })

    $('#package').on('click', '.no', function (e) {
      e.preventDefault()
      e.stopPropagation()
      $('.editing').remove()
      val.show()
      val = undefined
    })

    $('html').click(function (e) {
      $('.editing').remove()
      if (val) val.show()
      val = undefined
    })

    function updateMetadata () {
      var text = $('.editing textarea').val() || $('.editing input').val(),
          pkgName = $('.star').data('name'),
          data = {}

      switch (valKey) {
        case 'keywords':
          data.keywords = text.split(/[, ]+/)
          break;
        default:
          data[valKey] = text
          break;
      }

      // send the update over via ajax
      $.ajax({
        url: '/package/' + pkgName
      , data: JSON.stringify(data)
      , type: 'POST'
      })
      .done(function (resp) {
        val.text(text)
        $('.editing').remove()
        val.show()
        val = undefined
      })
      .error(function (resp) {
        // we're probably not logged in
        window.location = '/login?done=/package/' + pkgName
      })
    }

  }

})

function addExpiration () {
  var NUM_SECONDS = 60
  var d = new Date()
  d.setTime(d.getTime() + NUM_SECONDS*1000)
  return '; expires='+d.toGMTString()
}

function getPackages (name) {
  var packages = document.cookie.split(";")
                  .map(function(k) {
                    return k.trim().split("=")
                  })
                  .reduce(function (set, kv) {
                    set[kv.shift()] = kv.join("=");
                    return set
                  },{})

  return name ? packages[name] : packages
}

