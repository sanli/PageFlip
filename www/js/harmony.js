
(function(window,document,undefined){

    function ribbon( context )
    {
    	this.init( context );
    }

    ribbon.prototype =
    {
    	context: null,

    	mouseX: null, mouseY: null,

    	painters: null,

    	interval: null,

    	init: function( context )
    	{
    		this.context = context;
    		this.context.lineWidth = 1;
    		this.context.globalCompositeOperation = 'source-over';

    		this.mouseX = SCREEN_WIDTH / 2;
    		this.mouseY = SCREEN_HEIGHT / 2;

    		this.painters = new Array();

    		for (var i = 0; i < 50; i++)
    		{
    			this.painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
    		}

    		this.isDrawing = false;

            //每秒60 frame,考虑到Pad的性能,可以适当减少
    		this.interval = setInterval( bargs( function( _this ) { _this.update(); return false; }, this ), 1000/60 );
    	},

    	destroy: function()
    	{
    		clearInterval(this.interval);
    	},

    	strokeStart: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY

    		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.05 )";		

    		for (var i = 0; i < this.painters.length; i++)
    		{
    			this.painters[i].dx = mouseX;
    			this.painters[i].dy = mouseY;
    		}

    		this.shouldDraw = true;
    	},

    	stroke: function( mouseX, mouseY )
    	{
    		this.mouseX = mouseX;
    		this.mouseY = mouseY;
    	},

    	strokeEnd: function()
    	{

    	},

    	update: function()
    	{
    		var i;

    		for (i = 0; i < this.painters.length; i++)
    		{
    			this.context.beginPath();
    			this.context.moveTo(this.painters[i].dx, this.painters[i].dy);		

    			this.painters[i].dx -= this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this.mouseX) * this.painters[i].div) * this.painters[i].ease;
    			this.painters[i].dy -= this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this.mouseY) * this.painters[i].div) * this.painters[i].ease;
    			this.context.lineTo(this.painters[i].dx, this.painters[i].dy);
    			this.context.stroke();
    		}
    	}
    }

    function bargs( _fn )
    {
    	var n, args = [];
    	for( n = 1; n < arguments.length; n++ )
    		args.push( arguments[ n ] );
    	return function () { return _fn.apply( this, args ); };
    }

 
 

    function simple( context )
    {
        this.init( context );
    }

    simple.prototype =
    {
        context: null,

        prevMouseX: null, prevMouseY: null,

        init: function( context )
        {
            this.context = context;
            this.context.globalCompositeOperation = 'source-over';
            this.context.lineWidth = 2.5;
        },

        destroy: function()
        {
        },

        strokeStart: function( mouseX, mouseY )
        {
            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
            
            this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.5)";		
        },

        stroke: function( mouseX, mouseY )
        {
            this.context.beginPath();
 
            this.context.moveTo(this.prevMouseX, this.prevMouseY);

            this.context.lineTo(mouseX, mouseY);
            this.context.stroke();

            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
        },

        strokeEnd: function()
        {
            
        }
    }

 
    function chrome( context )
    {
        this.init( context );
    }

    chrome.prototype =
    {
        context: null,

        prevMouseX: null, prevMouseY: null,

        points: null, count: null,

        init: function( context )
        {
            this.context = context;
            this.context.lineWidth = 1;
            
            if (RegExp(" AppleWebKit/").test(navigator.userAgent))
                this.context.globalCompositeOperation = 'darker';

            this.points = new Array();
            this.count = 0;
        },

        destroy: function()
        {
        },

        strokeStart: function( mouseX, mouseY )
        {
            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
        },

        stroke: function( mouseX, mouseY )
        {
            var i, dx, dy, d;
            
            this.points.push( [ mouseX, mouseY ] );

            this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.1)";
            this.context.beginPath();
            this.context.moveTo(this.prevMouseX, this.prevMouseY);
            this.context.lineTo(mouseX, mouseY);
            this.context.stroke();

            for (i = 0; i < this.points.length; i++)
            {
                dx = this.points[i][0] - this.points[this.count][0];
                dy = this.points[i][1] - this.points[this.count][1];
                d = dx * dx + dy * dy;

                if (d < 1000)
                {
                    this.context.strokeStyle = "rgba(" + Math.floor(Math.random() * COLOR[0]) + ", " + Math.floor(Math.random() * COLOR[1]) + ", " + Math.floor(Math.random() * COLOR[2]) + ", 0.1 )";
                    this.context.beginPath();
                    this.context.moveTo( this.points[this.count][0] + (dx * 0.2), this.points[this.count][1] + (dy * 0.2));
                    this.context.lineTo( this.points[i][0] - (dx * 0.2), this.points[i][1] - (dy * 0.2));
                    this.context.stroke();
                }
            }

            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;

            this.count ++;
        },

        strokeEnd: function()
        {
            
        }
    }


    var i, brush, BRUSHES = ["ribbon","simple", "chrome"],
    COLOR = [0, 0, 0], BACKGROUND_COLOR = [250, 250, 250],
    SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    container, foregroundColorSelector, backgroundColorSelector, menu,
    canvas, context,
    isForegroundColorSelectorVisible = false, isBackgroundColorSelectorVisible = false, 
    isMenuMouseOver = false, shiftKeyIsDown = false, altKeyIsDown = false;

    


    window.harmony = function init()
    {
        var hash, palette;
        
        //document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

        container = document.createElement('div');
        document.body.appendChild(container);
        
        canvas = document.createElement("canvas");
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
        canvas.style.cursor = 'crosshair';
        container.appendChild(canvas);
        
        if (!canvas.getContext) return;
        
        context = canvas.getContext("2d");
        

        if (!brush)
        {
            //brush = new ribbon(context);
            //brush = new simple(context);
            brush = new chrome(context);
        }
        
        canvas.addEventListener('touchstart', onCanvasTouchStart, false);
    }



    // COLOR SELECTORS

    function setForegroundColor( x, y )
    {
        foregroundColorSelector.update( x, y );
        COLOR = foregroundColorSelector.getColor();
        menu.setForegroundColor( COLOR );	
    }

    function onForegroundColorSelectorMouseDown( event )
    {
        window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
        
        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );	
    }

    function onForegroundColorSelectorMouseMove( event )
    {
        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
    }

    function onForegroundColorSelectorMouseUp( event )
    {
        window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

        setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
    }

    function onForegroundColorSelectorTouchStart( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
            
            window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }
    }

    function onForegroundColorSelectorTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
        }
    }

    function onForegroundColorSelectorTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }	
    }


    //

    function setBackgroundColor( x, y )
    {
        backgroundColorSelector.update( x, y );
        BACKGROUND_COLOR = backgroundColorSelector.getColor();
        menu.setBackgroundColor( BACKGROUND_COLOR );
        
        document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';	
    }

    function onBackgroundColorSelectorMouseDown( event )
    {
        window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
    }

    function onBackgroundColorSelectorMouseMove( event )
    {
        setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
    }

    function onBackgroundColorSelectorMouseUp( event )
    {
        window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
        
        setBackgroundColor( event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop );
    }


    function onBackgroundColorSelectorTouchStart( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
            
            window.addEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }
    }

    function onBackgroundColorSelectorTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            setBackgroundColor( event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop );
        }
    }

    function onBackgroundColorSelectorTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            window.removeEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }	
    }


    // MENU

    function onMenuForegroundColor()
    {
        cleanPopUps();
        
        foregroundColorSelector.show();
        foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
        foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

        isForegroundColorSelectorVisible = true;
    }

    function onMenuBackgroundColor()
    {
        cleanPopUps();

        backgroundColorSelector.show();
        backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
        backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

        isBackgroundColorSelectorVisible = true;
    }

    function onMenuSelectorChange()
    {
        if (BRUSHES[menu.selector.selectedIndex] == "")
            return;

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");

        window.location.hash = BRUSHES[menu.selector.selectedIndex];
    }

    function onMenuMouseOver()
    {
        isMenuMouseOver = true;
    }

    function onMenuMouseOut()
    {
        isMenuMouseOver = false;
    }


    function onMenuClear()
    {
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
    }



    // CANVAS
    function onCanvasTouchStart( event )
    {
        cleanPopUps();		

        if(event.touches.length == 1)
        {
            event.preventDefault();
            
            brush.strokeStart( event.touches[0].pageX, event.touches[0].pageY );
            
            window.addEventListener('touchmove', onCanvasTouchMove, false);
            window.addEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    function onCanvasTouchMove( event )
    {
        if(event.touches.length == 1)
        {
            event.preventDefault();
            brush.stroke( event.touches[0].pageX, event.touches[0].pageY );
        }
    }

    function onCanvasTouchEnd( event )
    {
        if(event.touches.length == 0)
        {
            event.preventDefault();
            
            brush.strokeEnd();

            window.removeEventListener('touchmove', onCanvasTouchMove, false);
            window.removeEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    //

    function cleanPopUps()
    {
        if (isForegroundColorSelectorVisible)
        {
            foregroundColorSelector.hide();
            isForegroundColorSelectorVisible = false;
        }
            
        if (isBackgroundColorSelectorVisible)
        {
            backgroundColorSelector.hide();
            isBackgroundColorSelectorVisible = false;
        }
        
    }


})(this,this.document);


