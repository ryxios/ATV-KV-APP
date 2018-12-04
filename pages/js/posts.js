posts = [];
function getposts() {
  Framework7.request.get('https://atvkv.ch/wp-json/wp/v2/posts', function(data) {
		posts = JSON.parse(data)
    //console.log(posts);
    createpostlist(posts)
  });

}

function createpostlist(posts) {
  if ($$(".postlist").length > 0) {
    $$(".postlist").remove()
  }
  var output = '<div class="postlist"><div class="row align-items-stretch">'
  for (var i in posts) {
    var d = new Date(posts[i].date);
    var tag = d.getDate();
    var tagZahl = d.getDay();
    var monatZahl = d.getMonth();
    var stunde = d.getHours();
    var minute = addZero(d.getMinutes());
    output+='<div class="col-100 tablet-50">'
    output+='<div class="card">'
      output+='<div class="card-header align-items-flex-end posts-header post-link-more" style="background-image:url('+ posts[i].jetpack_featured_media_url +')" data-id="'+[i]+'"><mark>'+ posts[i].title.rendered +'</mark></div>'
      output+='<div class="card-content card-content-padding card-content-post">'
      output+='<p class="date">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] + '</p>'
      output+='<p>'+ posts[i].excerpt.rendered +'</p>'
      output+='</div>'
      output+='<div class="card-footer display-block"><a href="#" class="link float-right post-link-more" data-id="'+[i]+'">mehr</a></div>'
    output+='</div>'
    output+='</div>'
  }
  output+='</div></div>'
$$('.posts').append(output)
$$('.berichte-preloader').hide()
	$('.post-link-more').click(function() {
    var id = $$(this).attr("data-id");
    //console.log(posts[id]);
    html = posts[id].content.rendered
    //console.log(html);
    $html = $('<div />',{html:html});
    //console.log($html.find('a').addClass('external'));
    content = $html.find('a').addClass('link external')
    //console.log($html.html());
    postpop = app.popup.create({
  content: '<div class="popup">'+
            '<div class="view popup-view">'+
            '<div class="page">'+
            '<div class="navbar">'+
            '<div class="navbar-inner sliding">'+
            '<div class="left"></div>'+
            '<div class="title">Bericht</div>'+
            '<div class="right"><a href="#" class="link popup-close">'+
            '<i class="icon f7-icons ios-only">close</i>'+
            '<i class="icon material-icons md-only">close</i>'+
            '</a></div>'+
            '</div>'+
            '</div>'+
            '<div class="page-content">'+
                '<div class="card-header posts-header align-items-flex-end no-padding no-margin" style="background-image:url('+ posts[id].jetpack_featured_media_url +')"><mark>'+ posts[id].title.rendered +'</mark></div>'+
            '<div class="block block-strong inset post-content">'+
            '<p class="date">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] + '</p>'+
            '<p>'+ $html.html() +'</p>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>',
  // Events
  on: {
    open: function (popup) {
      //console.log('Popup open');
    },
    opened: function (popup) {
      //console.log($(".wp-block-quote a"));
    },
  }
});
postpop.open();
  });
}
