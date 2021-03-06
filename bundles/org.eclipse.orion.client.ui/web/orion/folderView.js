/*******************************************************************************
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
 
/*global define document*/
define(['orion/markdownView', 'orion/projects/projectEditor'], function(mMarkdownView, mProjectEditor) { //$NON-NLS-0$
	/** 
	 * Constructs a new FolderView object.
	 * 
	 * @class 
	 * @name orion.FolderView
	 */
	function FolderView(options) {
		this._parent = options.parent;
		this._input = options.input;
		this._contents = options.contents;
		this._metadata = options.metadata;
		this.fileClient = options.fileService;
		this.progress = options.progress;
		this.serviceRegistry = options.serviceRegistry;
		this.commandService = options.commandService;
		this._init();
	}
	FolderView.prototype = /** @lends orion.FolderView.prototype */ {
		_init: function(){
			this.markdownView = new mMarkdownView.MarkdownView({
				fileClient : this.fileClient,
				progress : this.progress
			});
			this.projectEditor = new mProjectEditor.ProjectEditor({
				fileClient : this.fileClient,
				progress : this.progress,
				serviceRegistry: this.serviceRegistry,
				commandService: this.commandService
			});
		},
		displayFolderView: function(children){
			var projectJson;
			var readmeMd;
			for (var i=0; i<children.length; i++) {
				var child = children[i];
				if (!child.Directory && child.Name === "project.json") { //$NON-NLS-0$
					projectJson = child;
				}
				if (!child.Directory && child.Name && child.Name.toLowerCase() === "readme.md") { //$NON-NLS-0$
					readmeMd = child;
				}

			}
			if(projectJson){
				this._node = document.createElement("div");
				this.projectEditor.displayContents(this._node, this._contents);
				this._parent.appendChild(this._node);
			} else if (readmeMd) {
				this._node = document.createElement("div");
				this.markdownView.displayInFrame(this._node, readmeMd);
				this._parent.appendChild(this._node);
			}
		},
		create: function() {
			if(this._contents.Children){
				this.displayFolderView(this._contents.Children);
			} else if(this._contents.ChildrenLocation){
				var _self = this;
				this.progress.progress(this.fileClient.fetchChildren(this._contents.ChildrenLocation), "Fetching children of " + this._contents.Name).then( 
					function(children) {
						_self.displayFolderView.call(_self, children);
					}
				);
			}
		},
		destroy: function() {
			if (this._node && this._node.parentNode) {
				this._node.parentNode.removeChild(this._node);
			}
			this._node = null;
		}
	};
	return {FolderView: FolderView};
});
