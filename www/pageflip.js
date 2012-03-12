

(function($) {
 
     // Dimensions of the whole book
     var BOOK_WIDTH = 1024;
     var BOOK_HEIGHT = 768;
     
     // Dimensions of one page in the book
     var PAGE_WIDTH = 1024;
     var PAGE_HEIGHT = 648;

     Pageflip = function(o){
         this.init(o) ;
     };
 
    Pageflip.prototype.init = function(o){

        // The canvas size equals to the book dimensions + this padding
        var CANVAS_PADDING = 50;

        var page = 0;

        this.canvas = document.getElementById( "pageflip-canvas" );
        //var canvas = document.getElementById( o.canvas );
        this.context = canvas.getContext( "2d" );
        
        //var book = document.getElementById( "book" );

        /*
        // List of all the page elements in the DOM
        var pages = book.getElementsByTagName( "section" );

        // Organize the depth of our pages and create the flip definitions
        for( var i = 0, len = pages.length; i < len; i++ ) {
        pages[i].style.zIndex = len - i;

        flips.push( {
            // Current progress of the flip (left -1 to right +1)
            progress: 1,
            // The target value towards which progress is always moving
            target: 1,
            // The page DOM element related to this flip
            page: pages[i], 
            // True while the page is being dragged
            dragging: false
            } );
        }*/
        var flipstate = {
            // 当前翻到的状态(left -1 to right +1)
            progress: 1,
            // 最终要翻到的状态
            target: 1，
            flipping : false ;
        } 

        //调整canvas到比书略大
        //canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
        canvas.width = BOOK_WIDTH ;
        canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );

        // Offset the canvas so that it's padding is evenly spread around the book
        canvas.style.top = -CANVAS_PADDING + "px";
        //canvas.style.left = -CANVAS_PADDING + "px";
        canvas.style.left = "0px" ;

        /**
         * 不再响应触摸事件
        // Render the page flip 60 times a second
        setInterval( render, 1000 / 25 );
        
        //document.addEventListener( "touchmove", mouseMoveHandler, false );
        //document.addEventListener( "touchstart", mouseDownHandler, false );
        //document.addEventListener( "touchend", mouseUpHandler, false ); 
        $("#book").on("touchmove" , mouseMoveHandler );
        $("#book").on("touchstart" , mouseDownHandler );
        $("#book").on("touchend" , mouseUpHandler );

        function mouseMoveHandler( event ) {
            // Offset mouse position so that the top of the spine is 0,0
            console.log("touchMove.....");
            var firstTouch = event.touches[0] ;
            mouse.x = firstTouch.clientX - book.offsetLeft - ( BOOK_WIDTH / 2 );
            mouse.y = firstTouch.clientY - book.offsetTop;
        }
 

        function mouseDownHandler( event ) {
            var firstTouch = event.touches[0] ;
            mouse.x = firstTouch.clientX - book.offsetLeft - ( BOOK_WIDTH / 2 );
            //mouse.x = firstTouch.clientX - book.offsetLeft - ( BOOK_WIDTH / 1.2 );
            mouse.y = firstTouch.clientY - book.offsetTop;
            //console.log("mouseDownHandler..... mouse.x:" + mouse.x + " mouse.y:" + mouse.y);

            if (Math.abs(mouse.x) < PAGE_WIDTH) {
                if (mouse.x < 0 && page - 1 >= 0) {
                    flips[page - 1].dragging = true;
                }else if (mouse.x > 0 && page + 1 < flips.length) {
                    flips[page].dragging = true;
                }
            }

            // Prevents the text selection cursor from appearing when dragging
            event.preventDefault();
        }

        function mouseUpHandler( event ) {
            //console.log("mouseUpHandler.....");

            for( var i = 0; i < flips.length; i++ ) {
                // If this flip was being dragged we animate to its destination
                if( flips[i].dragging ) {
                // Figure out which page we should go to next depending on the flip direction
                    if( mouse.x < 0 ) {
                        flips[i].target = -1;
                        page = Math.min( page + 1, flips.length );
                    }else {
                        flips[i].target = 1;
                        page = Math.max( page - 1, 0 );
                    }
                }

                flips[i].dragging = false;
            }
        }*/
    };
 
 
     Pageflip.prototype.render = function() {
     
         this.context.clearRect( 0, 0, canvas.width, canvas.height );
         
         var flip = this.flipstate ;
         flip.progress += ( flip.target - flip.progress ) * 0.2;
         
         
         // 如果处在flipping状态，
         if( Math.abs( flip.progress ) < 0.997 ) {
             //console.log("flip.progress=" + flip.progress);
             this.drawFlip( flip );
         }
     
     };
 
 
     Pageflip.prototype.drawFlip = function(flip){
         //console.log("drawFlip.... flip:");
         // Strength of the fold is strongest in the middle of the book
         var strength = 1 - Math.abs( flip.progress );
         
         // Width of the folded paper
         var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
         
         // X position of the folded paper
         var foldX = PAGE_WIDTH * flip.progress + foldWidth;
         //console.log("flip.progress:" + flip.progress + " foldX:" + foldX + " foldWidth:" + foldWidth) ;
         
         // How far the page should outdent vertically due to perspective
         var verticalOutdent = 20 * strength;
         
         // The maximum width of the left and right side shadows
         var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
         var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
         var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
         
         
         // Change page element width to match the x position of the fold
         flip.page.style.width = Math.max(foldX, 0) + "px";
         
         context.save();
         context.translate( CANVAS_PADDING , CANVAS_PADDING );
         
         
         // Draw a sharp shadow on the left side of the page
         context.strokeStyle = 'rgba(0,0,0,'+(0.15 * strength)+')';
         context.lineWidth = 80 * strength;
         context.beginPath();
         context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
         context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
         context.stroke();
         
         
         // Right side drop shadow
         var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
         rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
         rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
         
         context.fillStyle = rightShadowGradient;
         context.beginPath();
         context.moveTo(foldX, 0);
         context.lineTo(foldX + rightShadowWidth, 0);
         context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
         context.lineTo(foldX, PAGE_HEIGHT);
         context.fill();
         
         
         // Left side drop shadow
         var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
         leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
         leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
         
         context.fillStyle = leftShadowGradient;
         context.beginPath();
         context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
         context.lineTo(foldX - foldWidth, 0);
         context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
         context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
         context.fill();
         
         
         // Gradient applied to the folded paper (highlights & shadows)
         var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
         foldGradient.addColorStop(0.35, '#fafafa');
         foldGradient.addColorStop(0.73, '#eeeeee');
         foldGradient.addColorStop(0.9, '#fafafa');
         foldGradient.addColorStop(1.0, '#e2e2e2');
         
         context.fillStyle = foldGradient;
         context.strokeStyle = 'rgba(0,0,0,0.06)';
         context.lineWidth = 0.5;
         
         // Draw the folded piece of paper
         context.beginPath();
         context.moveTo(foldX, 0);
         context.lineTo(foldX, PAGE_HEIGHT);
         context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
         context.lineTo(foldX - foldWidth, -verticalOutdent);
         context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
         
         context.fill();
         context.stroke();
         
         
         context.restore();
     };
 
  
    Pageflip.prototype.fwd = function(){
        console.log("fword page");
    };

    Pageflip.prototype.bwd = function(){
        console.log("bword  page");
    };
 
})($);


