var GameView = {
    'viewscale' : 1.0000001,
    'offset_x' : 0,
    'offset_y' : 0,
    'dragState' : false,
    'dragCounter' : 0,
    'mouse_x' : 0,
    'mouse_y' : 0,
    'window_width': $(window).width(),
    'window_height': $(window).height(),
    'image_height' : 0,
    'image_width' : 0,
    'coord_x' : 0,
    'coord_y' : 0,
    'mode' : 'default',
    'terrainType' : 'null',
    'focused' : true
}

var n = function(){
	var img = new Image();
	img.onload = function(){
		GameView.image_width = this.width;
		GameView.image_height = this.height;
		$("svg#svg-path").attr('viewBox', '0 0 '+GameView.image_width+' '+GameView.image_height).css('width', GameView.image_width/(GameView.viewscale - 0.0000001)+"px ").css('height', GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('left', (-GameView.offset_x/GameView.viewscale)+"px ").css('top' , (-GameView.offset_y/GameView.viewscale)+"px");
		$("div#map").css('background-size', GameView.image_width/(GameView.viewscale - 0.0000001)+"px "+GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('background-position', (-GameView.offset_x/GameView.viewscale)+"px "+(-GameView.offset_y/GameView.viewscale)+"px");
	}
	img.src = "map.png";
	return;
}();

var newshape = [];

var allshapes = [];

var keyMap = { 16: false, 65: false, 83: false, 68: false , 80: false, 82: false, 90:false, 39: false, 37: false};

$("svg#svg-path").attr("viewBox", ("0 0 " + GameView.window_width + " " + GameView.window_height));
$("circle#cursor-path").attr("cx", GameView.coord_x).attr("cy", GameView.coord_y).attr("r", 1)

$(window).resize(function(){
	var wind = $("div#map");
	GameView.window_width = wind.width();
	GameView.window_height = wind.height();
	$("svg#svg-path").attr('viewBox', '0 0 '+GameView.image_width+' '+GameView.image_height).css('width', GameView.image_width/(GameView.viewscale - 0.0000001)+"px ").css('height', GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('left', (-GameView.offset_x/GameView.viewscale)+"px ").css('top' , (-GameView.offset_y/GameView.viewscale)+"px");
	$("div#map").css('background-size', GameView.image_width/(GameView.viewscale - 0.0000001)+"px "+GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('background-position', (-GameView.offset_x/GameView.viewscale)+"px "+(-GameView.offset_y/GameView.viewscale)+"px");
	
}).focus(function(){
	GameView.focused = true;
}).blur(function(){
	GameView.focused = false;
})

$("div#tools button").click(function(){
	$(this).siblings().removeClass("selected");
	$(this).addClass("selected");
	$("button#deletebutton").removeClass("selected");
	GameView.terrainType = $(this).attr('val');
});

$("button#deletebutton").click(function(){
	$("button#changebutton").removeClass("selected");
	if(GameView.mode == 'delete'){
		GameView.mode = 'default';
		$(this).removeClass("selected");
	}else{
		GameView.mode = "delete";
		$(this).addClass("selected");
	}
});

$("button#changebutton").click(function(){
	$("button#deletebutton").removeClass("selected");
	if(GameView.mode == 'terrain'){
		GameView.mode = 'default';
		$(this).removeClass("selected");
	}else{
		GameView.mode = "terrain";
		$(this).addClass("selected");
	}
});

$("div#map").on('DOMMouseScroll mousewheel', function(e){
	if(GameView.focused){
		var e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if(keyMap[16]){
			if(delta > 0){
				GameView.viewscale -= 0.01;
			}else{
				GameView.viewscale += 0.01;
			}
			$("svg#svg-path").attr('viewBox', '0 0 '+GameView.image_width+' '+GameView.image_height).css('width', GameView.image_width/(GameView.viewscale - 0.0000001)+"px ").css('height', GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('left', (-GameView.offset_x/GameView.viewscale)+"px ").css('top' , (-GameView.offset_y/GameView.viewscale)+"px");
			$("div#map").css('background-size', GameView.image_width/(GameView.viewscale - 0.0000001)+"px "+GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('background-position', (-GameView.offset_x/GameView.viewscale)+"px "+(-GameView.offset_y/GameView.viewscale)+"px");
		}else{
			var newboundary = $("input#scalebox").val();
			if(newboundary == "") newboundary = 0;
			newboundary = parseInt(newboundary);
			if(delta > 0){
				newboundary += 1;
			}else{
				newboundary -= 1;
				if(newboundary < 0) newboundary = 0;
			}
			$("input#scalebox").val(newboundary);
		}
		redefineCursorBoundary();
	}
	
}).on('mousedown', function(){
	GameView.dragState = true;
    GameView.dragCounter = 0;
}).on('mousemove', async function(e){
	GameView.mouse_x = e.pageX;
	GameView.mouse_y = e.pageY;
    var k_p = convOffsetToRelative(e.pageX, e.pageY);
    if(GameView.dragState && GameView.dragCounter > 10){
    	var threshold = 1000;
    	var newoffset_x = (k_p[0] - GameView.coord_x);
    	var newoffset_y = (k_p[1] - GameView.coord_y);
    	//if( Math.abs(newoffset_x) <= threshold) 
    	GameView.offset_x -= newoffset_x*0.64;
    	//if( Math.abs(newoffset_y) <= threshold) 
    	GameView.offset_y -= newoffset_y*0.64;
        //GameView.offset_x -= (k_p[0] - GameView.coord_x)*0.5//*GameView.viewscale*(5.78/GameView.viewscale);
        //GameView.offset_y -= (k_p[1] - GameView.coord_y)*0.5//*GameView.viewscale*(5.78/GameView.viewscale);

        $("svg#svg-path").attr('viewBox', '0 0 '+GameView.image_width+' '+GameView.image_height).css('width', GameView.image_width/(GameView.viewscale - 0.0000001)+"px ").css('height', GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('left', (-GameView.offset_x/GameView.viewscale)+"px ").css('top' , (-GameView.offset_y/GameView.viewscale)+"px");
		$("div#map").css('background-size', GameView.image_width/(GameView.viewscale - 0.0000001)+"px "+GameView.image_height/(GameView.viewscale - 0.0000001)+"px").css('background-position', (-GameView.offset_x/GameView.viewscale)+"px "+(-GameView.offset_y/GameView.viewscale)+"px");
    }
    
    GameView.coord_x = k_p[0]
    GameView.coord_y = k_p[1];
    $("div#coordinates").text("  " + Math.floor(GameView.coord_x) + "," + Math.floor(GameView.coord_y) );

    GameView.dragCounter++;
    redefineCursorBoundary();

}).on('mouseup', function(){
	GameView.dragState = false;
    if(GameView.dragCounter > 10){
    }else{
    	if(GameView.mode!='default'){
    		for(index_0 in allshapes){
    			if(insideShape([GameView.coord_x, GameView.coord_y], allshapes[index_0]['shape'])){
    				switch(GameView.mode){
    					case 'delete':
    						deleteShape(index_0);
    						break;
    					case 'terrain':
    						allshapes[index_0]['terrain_type'] = GameView.terrainType;
    						break;
    					default:
    						// nothing here
    						break;
    				}
    			}
    		}
    		redefineAllShapes();
    	}else{
	    	keys = function(){
	    		if(allshapes.length < 1) return false;
	    		var boundary = parseInt($("input#scalebox").val());
	    		if(boundary==''||boundary==undefined) boundary = 15;
	    		var NearPoints = allNearPoints([GameView.coord_x,GameView.coord_y], boundary, allshapes);
	    		if(NearPoints.length < 1) return false;
	    		return closestPoint([GameView.coord_x,GameView.coord_y], NearPoints);
	    	}();
	    	if(!keys){
	    		newshape.push([GameView.coord_x,GameView.coord_y]);
	    	}else{
	    		newshape.push(keys);
	    	}
	    	redefineCurrentShape();
   		}
    }
}).on('mouseleave', function(){
	GameView.dragState = false;
	GameView.dragCounter = 0;
});

function convOffsetToRelative(x_0,y_0){
	var cct = (x_0*(GameView.viewscale) + GameView.offset_x)//*(GameView.image_width/GameView.window_width);
	var xxt = (y_0*(GameView.viewscale)  + GameView.offset_y)//*(GameView.image_height/GameView.window_height);
	return [cct,xxt];
}

function deleteShape(id){
	f = parseInt(id);
	if(id > -1){
		allshapes.splice(f,1);
		for(var i=f; i < allshapes.length; i++){
			allshapes[i]['val'] = allshapes[i]['val'] - 1;
		}
	}
}

function insideShape(point, shapearray){
	var max_H = shapearray[0][1];
	var max_W = shapearray[0][0];
	var min_H = shapearray[0][1];
	var min_W = shapearray[0][0];
	for(index in shapearray){
		if(shapearray[index][0] > max_W) max_W = shapearray[index][0];
		if(shapearray[index][0] < min_W) min_W = shapearray[index][0];
		if(shapearray[index][1] > max_H) max_H = shapearray[index][1];
		if(shapearray[index][1] < min_H) min_H = shapearray[index][1];
	}
	return (point[0] > min_W && point[0] < max_W && point[1] > min_H && point[1] < max_H && insideShapeRobust(point, shapearray))
}

function insideShapeRobust(point, array){
	var collisionCounter = 0;
	var len = array.length;
	for(var i=0; i < len; i++){
		if(lineCollider([point,[point[0]+10000,point[1]+10000]],[array[i],array[(i+1)%len]])) collisionCounter++;
	}
	return ((collisionCounter%2)>0);
}

function lineCollider(line_0, line_1){
	var onSegment = function(a_0, b_0, c_0){
		return (b_0[0] <= Math.max(...[a_0[0], c_0[0]]) && b_0 >= Math.min(...[b_0[0], c_0[0]]) && b_0[1] <= Math.max(...[a_0[1], c_0[1]]) && b_0[1] >= Math.min(...[a_0[1], c_0[1]]))
	}
	var orientation = function(a_0, b_0, c_0){
		var val_0 = ((b_0[1] - a_0[1]) * (c_0[0] - b_0[0])) - ((b_0[0] - a_0[0]) * (c_0[1] - b_0[1]));

		if(val_0 > 0) return 1;
		if(val_0 < 0) return 2;
		return 0;
	}
	var intersecting = function(p_1_0, p_1_1, p_2_0, p_2_1){
		var orients = [
			orientation(p_1_0, p_1_1, p_2_0),
			orientation(p_1_0, p_1_1, p_2_1),
			orientation(p_2_0, p_2_1, p_1_0),
			orientation(p_2_0, p_2_1, p_1_1)
		];
		//normal case
		if((orients[0] != orients[1]) && (orients[2] != orients[3])) return true;
		// other cases ;-;
		if(orients[0] === 0 && onSegment(p_1_0, p_2_0, p_1_1)) return true;
		if(orients[1] === 0 && onSegment(p_1_0, p_2_1, p_1_1)) return true;
		if(orients[2] === 0 && onSegment(p_2_0, p_1_0, p_2_1)) return true;
		if(orients[3] === 0 && onSegment(p_2_0, p_1_1, p_2_1)) return true;
		return false;
	}
	return intersecting(line_0[0], line_0[1], line_1[0], line_1[1]);
}

function allNearPoints(point_0, boundary, shapearray){
	return_arr = [];
	upMoX = point_0[0] + boundary;
	loMoX = point_0[0] - boundary;
	upMoY = point_0[1] + boundary;
	loMoY = point_0[1] - boundary;
	for(index in shapearray){
		for(index_0 in shapearray[index]['shape']){
			if((loMoX <= shapearray[index]['shape'][index_0][0]) && (shapearray[index]['shape'][index_0][0] <= upMoX) && (loMoY <= shapearray[index]['shape'][index_0][1]) && (shapearray[index]['shape'][index_0][1] <= upMoY)){
				return_arr.push(shapearray[index]['shape'][index_0]);
			}
		}
	}
	return return_arr;
}

function closestPoint(point_0, shapearray){
	var mX = GameView.coord_x;
	var mY = GameView.coord_y;
	if(shapearray.length < 1) return false;
	var finalPoint = shapearray[0];
	var shortestDistance = 100000;
	for(var f=0; f < shapearray.length; f++){
		var fhr = Math.sqrt(Math.abs((shapearray[f][0] - mX)**2 + (shapearray[f][1] - mY)**2));
		if( fhr < shortestDistance){
			shortestDistance = fhr;
			finalPoint = shapearray[f];
		}
	}
	return finalPoint;					
}

function redefineCurrentShape(){
	var string = "";
	for(index in newshape){
		if(index==0){
			string+= "M"+newshape[0][0]+" "+newshape[0][1]+" ";
			continue;
		}
		string+= "L"+newshape[index][0]+" "+newshape[index][1]+" ";
	}
	string+="Z";
	$("path#current-path").attr("d",string);
}

function redefineCursorBoundary(){
	var string = "";
	var boundary = $("input#scalebox").val();
	if(boundary == ""){
		$("circle#cursor-path").attr("cx", GameView.coord_x).attr("cy", GameView.coord_y).attr("r", "0");
		return;
	}
	$("circle#cursor-path").attr("cx", GameView.coord_x).attr("cy", GameView.coord_y).attr("r", boundary);
}

function redefineAllShapes(){
	var string = "<circle id=\"cursor-path\"></circle><path id=\"current-path\"></path>";
	for(index_0 in allshapes){
		string+= "<path val=\""+allshapes[index_0]['id']+"\" class=\"rendered-path "+allshapes[index_0]['terrain_type']+"\" d=\"";
		for(index_1 in allshapes[index_0]['shape']){
			if(index_1==0){
				string+= "M"+allshapes[index_0]['shape'][0][0]+" "+allshapes[index_0]['shape'][0][1]+" ";
				continue;
			}
			string+= "L"+allshapes[index_0]['shape'][index_1][0]+" "+allshapes[index_0]['shape'][index_1][1]+" ";
		}
		string+="Z\"></path>";
	}
	$("svg#svg-path").html(string);
	redefineCurrentShape();
	redefineCursorBoundary();
}

function renderNewShape(){
	var string = "<path val=\""+newshape['id']+"\" class=\"rendered-path "+newshape['terrain_type']+"\" d=\"";
	for(index in newshape){
		if(index==0){
			string+="M"+newshape[0][0]+" "+newshape[0][1]+" ";
			continue;
		}
		string+="L"+newshape[index][0]+" "+newshape[index][1]+" ";
	}
	string+="Z\"></path>";
	$("svg#svg-path").append(string);
	$("svg#svg-path").html($("svg#svg-path").html());
}

$(document).keydown(function(e){
	if(e.keyCode in keyMap){
		keyMap[e.keyCode] = true;
		if(keyMap[16] && keyMap[65]){
			newshape = [];
			$("path#current-path").attr("d","");
		}
		if(keyMap[16] && keyMap[68]){
			newshape.pop();
			redefineCurrentShape();
		}
		if(keyMap[16] && keyMap[83]){
			$("path#current-path").attr("d","");
			if(newshape.length > 2){
				allshapes.push({ 'id' : allshapes.length, 'shape' : newshape, 'terrain_type' : GameView.terrainType, 'center' : function(){
					var count = [0, 0];
					for(ad in newshape){
						count[0]+= newshape[ad][0];
						count[1]+= newshape[ad][1];
					}

					return [Math.floor(count[0]/newshape.length), Math.floor(count[1]/newshape.length)];
				}()});
			}
			renderNewShape();
			newshape = [];
		}
		if(keyMap[80] && keyMap[16]){
			keyMap = $.map(keyMap, function(keys){
				return false;
			});
			download(JSON.stringify(allshapes), 'map.txt', 'text/plain');
		}
		if(keyMap[16] && keyMap[82]){
			var myFile = $('#fileinput').prop('files')[0];
			var reader = new FileReader();
			reader.onload = function (e) {
                output = e.target.result;
                allshapes = $.parseJSON(output);
                redefineAllShapes();
            };
            reader.readAsText(myFile);
            n = function(){
				var img = new Image();
				img.onload = function(){
					GameView.image_width = this.width;
					GameView.image_height = this.height;
				}
				img.src = "map.png";
				return;
			}();
		}
		if(keyMap[16] && keyMap[90]){
			allshapes.pop();
			redefineAllShapes();
		}
	}
}).keyup(function(e){
	if(e.keyCode in keyMap){
		keyMap[e.keyCode] = false;
	}
});

function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);
    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    }
    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    };
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}