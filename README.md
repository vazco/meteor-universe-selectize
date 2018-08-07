<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/Universe Selectize
</h1>

&nbsp;

<a href="http://vazco.eu" target="_blank"><img src="https://vazco.eu/universe-banner.png" /></a>

&nbsp;

> This package is part of Universe, a framework based on [Meteor platform](http://meteor.com)
maintained by [Vazco](http://www.vazco.eu).

> It works standalone, but you can get max out of it when using the whole system.

## Demo
http://universe-autoform-select.stg.vazco.eu/

https://github.com/vazco/meteor-universe-selectize-demo.git


## Installation

In a Meteor app directory, enter:

```bash
$ meteor add vazco:universe-selectize
```

## Usage

```js
{{> universeSelectize name="test1" options=options multiple=false create=true}}

{{> universeSelectize name="test2" options=options multiple=true create=true remove=true}}
```

## Options

<table width="100%">
	<tr>
		<th valign="top" colspan="4" align="left"><a href="#general" name="general">universe-selectize options</a></th>
	</tr>
	<tr>
		<th valign="top" width="120px" align="left">Option</th>
		<th valign="top" align="left">Description</th>
		<th valign="top" width="60px" align="left">Type</th>
		<th valign="top" width="60px" align="left">Default</th>
	</tr>
	<tr>
		<td valign="top"><code>options</code></td>
		<td valign="top"><i>Required.</i> A function returning either an array of options, or a <code>Mongo.Cursor</code>. The function is re-evaluated automatically using <code>Tracker</code> when its reactive data sources change.</td>
		<td valign="top"><code>function</code></td>
		<td valign="top"><code>undefined</code></td>
	</tr>
	<tr>
        <td valign="top"><code>placeholder</code></td>
        <td valign="top"><i>Optional.</i> A placeholder option.</td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>null</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsPlaceholder</code></td>
        <td valign="top"><i>Optional.</i> Show placeholder in options dropdown.</td>
        <td valign="top"><code>Boolean or String</code></td>
        <td valign="top"><code>false</code></td>
    </tr>
	<tr>
        <td valign="top"><code>disabled</code></td>
        <td valign="top"><i>Optional.</i></td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>false</code></td>
    </tr>
	<tr>
		<td valign="top"><code>multiple</code></td>
		<td valign="top"><i>Optional.</i> </td>
		<td valign="top"><code>Boolean</code></td>
		<td valign="top"><code>false</code></td>
	</tr>
	<tr>
        <td valign="top"><code>removeButton</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>create</code></td>
        <td valign="top"><i>Optional. Allows the user to create a new items that aren't in the list of options.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createText</code></td>
        <td valign="top"><i>Optional. Allows the user to change the create text.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createMethod</code></td>
        <td valign="top"><i>Optional. Name of method to call after create new item. Method can return new value for item.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethod</code></td>
        <td valign="top"><i>Optional. Name of method to get more items. Method should return array of options.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethodParams</code></td>
        <td valign="top"><i>Optional. Additional params for optionsMethod.</i> </td>
        <td valign="top"><code>Object</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>sortMethod</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Function</code></td>
        <td valign="top"><code>'label'</code></td>
    </tr>
</table>

## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Universe Selectize is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
